import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Sheet } from './entities/sheet.entity';
import { SheetUploadedEvent } from '../notifications/events/sheet-uploaded.event';
import { StorageService } from '../storage/storage.service';
import { IUnitOfWork, UNIT_OF_WORK } from '../common/database';
import { CacheService } from '../common/cache';

export const CACHE_KEY_SHEETS_ALL = 'musicfolder:v1:sheets:all';
export const CACHE_NAMESPACE_SHEETS = 'musicfolder:v1:sheets:*';
export const CACHE_TTL_SHEETS = 600; // 10 minutos (600s)

export interface ScoreItem {
  id: string;
  title: string;
  composer: string;
  ensemble: string;
  category: 'Orquesta' | 'Cámara' | 'Solista' | 'Coro';
  difficulty?: string;
  isFavorite?: boolean;
  type?: string;
  owner?: string;
}

@Injectable()
export class SheetsService {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @InjectRepository(Sheet)
    private readonly sheetRepository: Repository<Sheet>,
    private readonly eventEmitter: EventEmitter2,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  private mapSheetToScoreItem(sheet: Sheet): ScoreItem {
    return {
      id: sheet.id,
      title: sheet.title,
      composer: sheet.composer || 'Anónimo',
      ensemble: sheet.instrument_role || 'Orquesta completa',
      category: 'Orquesta',
      difficulty: sheet.difficulty_level || 'Intermedio',
      isFavorite: sheet.is_public || false,
      type: (sheet.file_format as string) || 'pdf',
      owner: sheet.owner_id || 'Orquesta Principal',
    };
  }

  async findAll(): Promise<ScoreItem[]> {
    const cached = await this.cacheService.get<ScoreItem[]>(CACHE_KEY_SHEETS_ALL);
    if (cached) {
      return cached;
    }

    const sheets = await this.sheetRepository.find({
      order: { created_at: 'DESC' },
    });
    const result = sheets.map((s) => this.mapSheetToScoreItem(s));

    await this.cacheService.set(CACHE_KEY_SHEETS_ALL, result, CACHE_TTL_SHEETS);
    return result;
  }

  async create(payload: Partial<ScoreItem>): Promise<ScoreItem> {
    return this.unitOfWork.runInTransaction(async (uow) => {
      const sheetRepo = uow.getRepository(Sheet);
      const sheet = sheetRepo.create({
        title: payload.title || 'Nueva Obra',
        composer: payload.composer || 'Anónimo',
        instrument_role: payload.ensemble || 'Orquesta completa',
        difficulty_level: payload.difficulty || 'intermediate',
        file_format: payload.type || 'pdf',
        file_url: 'https://example.com/scores/default.pdf',
        file_size: 1000000,
        key_signature: 'C Major',
        time_signature: '4/4',
        is_public: payload.isFavorite || false,
      });

      const saved = await sheetRepo.save(sheet);
      const score = this.mapSheetToScoreItem(saved);

      // Programar la emisión del evento de notificación e invalidación de caché Post-Commit
      uow.registerPostCommitTask(async () => {
        this.eventEmitter.emit(
          'sheet.uploaded',
          new SheetUploadedEvent(
            score.id,
            score.title,
            score.composer,
            score.ensemble,
            score.owner,
          ),
        );
        await this.cacheService.delByPattern(CACHE_NAMESPACE_SHEETS);
      });

      return score;
    });
  }

  async findOne(id: string): Promise<ScoreItem> {
    const sheet = await this.sheetRepository.findOne({ where: { id } });
    if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);
    return this.mapSheetToScoreItem(sheet);
  }

  async update(id: string, payload: Partial<ScoreItem>): Promise<ScoreItem> {
    return this.unitOfWork.runInTransaction(async (uow) => {
      const sheetRepo = uow.getRepository(Sheet);
      const sheet = await sheetRepo.findById(id);
      if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);

      if (payload.title) sheet.title = payload.title;
      if (payload.composer) sheet.composer = payload.composer;
      if (payload.ensemble) sheet.instrument_role = payload.ensemble;
      if (payload.type) sheet.file_format = payload.type;

      const saved = await sheetRepo.save(sheet);

      uow.registerPostCommitTask(async () => {
        await this.cacheService.delByPattern(CACHE_NAMESPACE_SHEETS);
      });

      return this.mapSheetToScoreItem(saved);
    });
  }

  async attachFile(id: string, filePath: string, size: number, format: string): Promise<ScoreItem> {
    return this.unitOfWork.runInTransaction(async (uow) => {
      const sheetRepo = uow.getRepository(Sheet);
      const sheet = await sheetRepo.findById(id);
      if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);

      sheet.file_url = filePath;
      sheet.file_size = size;
      sheet.file_format = format;

      const saved = await sheetRepo.save(sheet);
      const score = this.mapSheetToScoreItem(saved);

      uow.registerPostCommitTask(async () => {
        this.eventEmitter.emit(
          'sheet.uploaded',
          new SheetUploadedEvent(
            score.id,
            score.title,
            score.composer,
            score.ensemble,
            score.owner,
          ),
        );
        await this.cacheService.delByPattern(CACHE_NAMESPACE_SHEETS);
      });

      return score;
    });
  }

  /**
   * Referencia del archivo tal como la guarda el adaptador de almacenamiento
   * (ruta local o clave del objeto en S3/R2). Nunca se expone al cliente.
   */
  async getStoredReference(id: string): Promise<string | null> {
    const sheet = await this.sheetRepository.findOne({ where: { id } });
    if (!sheet) return null;
    return sheet.file_url || null;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    return this.unitOfWork.runInTransaction(async (uow) => {
      const sheetRepo = uow.getRepository(Sheet);
      const sheet = await sheetRepo.findById(id);
      if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);

      await sheetRepo.delete(id);

      // Tarea Post-Commit: Eliminar archivo físico y purgar caché en Redis tras COMMIT exitoso
      const fileUrl = sheet.file_url;
      uow.registerPostCommitTask(async () => {
        if (fileUrl) {
          await this.storageService.deleteFile(fileUrl);
        }
        await this.cacheService.delByPattern(CACHE_NAMESPACE_SHEETS);
      });

      return { success: true };
    });
  }
}
