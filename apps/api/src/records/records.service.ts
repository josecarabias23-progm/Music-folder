import { Injectable, NotFoundException } from '@nestjs/common';

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
  private readonly records: RehearsalRecord[] = [
    { id: '1', title: 'Ensayo general', type: 'General', date: 'Jueves, 31 de julio', time: '19:00–22:00', venue: 'Auditorio Manuel de Falla', attendeesCount: 46, notes: 'Revisar pasajes de Beethoven Mvt 2' },
    { id: '2', title: 'Seccionales de cuerdas', type: 'Seccional', date: 'Lunes, 28 de julio', time: '18:00–20:00', venue: 'Sala de Ensayo B', attendeesCount: 18, notes: 'Trabajar afinación de violines II' },
    { id: '3', title: 'Concierto de cámara', type: 'Concierto', date: 'Sábado, 02 de agosto', time: '20:30–22:30', venue: 'Sala Principal', attendeesCount: 52, notes: 'Código de vestimenta: Frac / Vestido negro' },
  ];

  findAll() {
    return this.records;
  }

  create(payload: Partial<RehearsalRecord>) {
    const record: RehearsalRecord = {
      id: String(Date.now()),
      title: payload.title || 'Nuevo ensayo',
      type: payload.type || 'General',
      date: payload.date || 'Próxima fecha',
      time: payload.time || '19:00 - 21:00',
      venue: payload.venue || 'Sala Principal',
      attendeesCount: payload.attendeesCount || 0,
      notes: payload.notes || '',
    };
    this.records.unshift(record);
    return record;
  }

  findOne(id: string) {
    const record = this.records.find((item) => String(item.id) === id);
    if (!record) throw new NotFoundException(`Record ${id} not found`);
    return record;
  }

  update(id: string, payload: Partial<RehearsalRecord>) {
    const record = this.findOne(id);
    Object.assign(record, payload);
    return record;
  }

  remove(id: string) {
    const index = this.records.findIndex((item) => String(item.id) === id);
    if (index < 0) throw new NotFoundException(`Record ${id} not found`);
    this.records.splice(index, 1);
    return { success: true };
  }
}

