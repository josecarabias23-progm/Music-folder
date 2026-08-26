import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RehearsalLog } from './entities/rehearsal-log.entity';
import { RehearsalScheduledEvent } from '../notifications/events/rehearsal-scheduled.event';
import { AttendanceMarkedEvent } from '../notifications/events/attendance-marked.event';

export interface RehearsalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  attendeesCount?: number;
  notes?: string;
}

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(RehearsalLog)
    private readonly logRepository: Repository<RehearsalLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private mapEntityToRecord(log: RehearsalLog): RehearsalRecord {
    return {
      id: log.id,
      title: log.title,
      type: log.type || 'General',
      date: log.date_text || '',
      time: log.time_text || '',
      venue: log.venue || '',
      attendeesCount: log.attendees_count ?? 0,
      notes: log.notes || '',
    };
  }

  async findAll(): Promise<RehearsalRecord[]> {
    const logs = await this.logRepository.find({
      order: { created_at: 'DESC' },
    });
    return logs.map((l) => this.mapEntityToRecord(l));
  }

  async create(payload: Partial<RehearsalRecord>): Promise<RehearsalRecord> {
    const log = this.logRepository.create({
      title: payload.title || 'Nuevo ensayo',
      type: payload.type || 'General',
      date_text: payload.date || 'Próxima fecha',
      time_text: payload.time || '19:00 - 21:00',
      venue: payload.venue || 'Sala Principal',
      attendees_count: payload.attendeesCount || 0,
      notes: payload.notes || '',
    });
    const saved = await this.logRepository.save(log);
    const record = this.mapEntityToRecord(saved);

    // Emit Event for Notifications
    this.eventEmitter.emit(
      'rehearsal.scheduled',
      new RehearsalScheduledEvent(
        record.id,
        record.title,
        record.date,
        record.time,
        record.venue,
        'Dirección Musical',
      ),
    );

    return record;
  }

  async recordAttendance(
    id: string,
    userId: string,
    userName: string,
    status: 'presente' | 'ausente' | 'justificado',
  ) {
    const record = await this.findOne(id);
    this.eventEmitter.emit(
      'attendance.marked',
      new AttendanceMarkedEvent(
        record.id,
        record.title,
        userId,
        userName,
        status,
        record.date,
      ),
    );
    return { success: true, status, rehearsal: record.title };
  }

  async findOne(id: string): Promise<RehearsalRecord> {
    const log = await this.logRepository.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Record ${id} not found`);
    return this.mapEntityToRecord(log);
  }

  async update(id: string, payload: Partial<RehearsalRecord>): Promise<RehearsalRecord> {
    const log = await this.logRepository.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Record ${id} not found`);

    if (payload.title) log.title = payload.title;
    if (payload.type) log.type = payload.type;
    if (payload.date) log.date_text = payload.date;
    if (payload.time) log.time_text = payload.time;
    if (payload.venue) log.venue = payload.venue;
    if (payload.attendeesCount !== undefined) log.attendees_count = payload.attendeesCount;
    if (payload.notes !== undefined) log.notes = payload.notes;

    const saved = await this.logRepository.save(log);
    return this.mapEntityToRecord(saved);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const result = await this.logRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Record ${id} not found`);
    return { success: true };
  }
}

