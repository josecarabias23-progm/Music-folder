import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sheet } from './entities/sheet.entity';

@Injectable()
export class SheetsService {
  constructor(
    @InjectRepository(Sheet)
    private readonly sheetsRepository: Repository<Sheet>,
  ) {}

  async findAll() {
    return this.sheetsRepository.find();
  }

  async create(payload: Partial<Sheet>) {
    const sheet = new Sheet();
    Object.assign(sheet, {
      title: payload.title || 'Nueva Obra',
      composer: payload.composer || 'Anónimo',
      owner_id: payload.owner_id || 'user-seed',
      organization_id: payload.organization_id || null,
      file_url: payload.file_url || 'https://example.com/score.pdf',
      file_format: payload.file_format || 'pdf',
      file_size: payload.file_size || 0,
      instrument_role: payload.instrument_role || 'General',
      key_signature: payload.key_signature || 'C',
      time_signature: payload.time_signature || '4/4',
      duration_minutes: payload.duration_minutes || null,
      difficulty_level: payload.difficulty_level || 'beginner',
      tags: payload.tags || [],
      is_public: payload.is_public ?? false,
    });

    return this.sheetsRepository.save(sheet);
  }

  async findOne(id: string) {
    const sheet = await this.sheetsRepository.findOne({ where: { id } });
    if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);
    return sheet;
  }

  async update(id: string, payload: Partial<Sheet>) {
    const sheet = await this.findOne(id);
    Object.assign(sheet, payload);
    return this.sheetsRepository.save(sheet);
  }

  async remove(id: string) {
    const sheet = await this.findOne(id);
    await this.sheetsRepository.remove(sheet);
    return { success: true };
  }
}
