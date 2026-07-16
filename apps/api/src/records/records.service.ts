import { Injectable } from '@nestjs/common';

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
}
