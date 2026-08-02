import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RehearsalLog } from './entities/rehearsal-log.entity';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(RehearsalLog)
    private readonly rehearsalRepository: Repository<RehearsalLog>,
  ) {}

  async findAll() {
    return this.rehearsalRepository.find();
  }

  async create(payload: Partial<RehearsalLog>) {
    const record = this.rehearsalRepository.create({
      title: payload.title || 'Nuevo ensayo',
      type: payload.type || 'General',
      date_text: payload.date_text || 'Próxima fecha',
      time_text: payload.time_text || '19:00 - 21:00',
      venue: payload.venue || 'Sala Principal',
      attendees_count: payload.attendees_count || 0,
      notes: payload.notes || '',
    });

    return this.rehearsalRepository.save(record);
  }

  async findOne(id: string) {
    const record = await this.rehearsalRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`Record ${id} not found`);
    return record;
  }

  async update(id: string, payload: Partial<RehearsalLog>) {
    const record = await this.findOne(id);
    Object.assign(record, payload);
    return this.rehearsalRepository.save(record);
  }

  async remove(id: string) {
    const record = await this.findOne(id);
    await this.rehearsalRepository.remove(record);
    return { success: true };
  }
}

