import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sheet } from './entities/sheet.entity';

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
    @InjectRepository(Sheet)
    private readonly sheetRepository: Repository<Sheet>,
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
    const sheets = await this.sheetRepository.find({
      order: { created_at: 'DESC' },
    });
    return sheets.map((s) => this.mapSheetToScoreItem(s));
  }

  async create(payload: Partial<ScoreItem>): Promise<ScoreItem> {
    const sheet = this.sheetRepository.create({
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
    const saved = await this.sheetRepository.save(sheet);
    return this.mapSheetToScoreItem(saved);
  }

  async findOne(id: string): Promise<ScoreItem> {
    const sheet = await this.sheetRepository.findOne({ where: { id } });
    if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);
    return this.mapSheetToScoreItem(sheet);
  }

  async update(id: string, payload: Partial<ScoreItem>): Promise<ScoreItem> {
    const sheet = await this.sheetRepository.findOne({ where: { id } });
    if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);

    if (payload.title) sheet.title = payload.title;
    if (payload.composer) sheet.composer = payload.composer;
    if (payload.ensemble) sheet.instrument_role = payload.ensemble;
    if (payload.type) sheet.file_format = payload.type;

    const saved = await this.sheetRepository.save(sheet);
    return this.mapSheetToScoreItem(saved);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const result = await this.sheetRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Sheet ${id} not found`);
    return { success: true };
  }
}
