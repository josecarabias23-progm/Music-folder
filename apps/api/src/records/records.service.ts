import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class RecordsService {
  private readonly records = [
    { id: 1, title: 'Ensayo de primavera', artist: 'Orquesta Municipal', date: '2025-04-12' },
    { id: 2, title: 'Música de cámara', artist: 'Coro Juvenil', date: '2025-06-01' },
  ];

  findAll() {
    return this.records;
  }

  create(payload: { title: string; artist: string; date: string }) {
    const record = { id: Date.now(), ...payload };
    this.records.push(record);
    return record;
  }

  findOne(id: string) { const record = this.records.find((item) => String(item.id) === id); if (!record) throw new NotFoundException(`Record ${id} not found`); return record; }
  update(id: string, payload: Partial<{ title: string; artist: string; date: string }>) { const record = this.findOne(id); Object.assign(record, payload); return record; }
  remove(id: string) { const index = this.records.findIndex((item) => String(item.id) === id); if (index < 0) throw new NotFoundException(`Record ${id} not found`); this.records.splice(index, 1); }
}
