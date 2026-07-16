import { Injectable } from '@nestjs/common';

@Injectable()
export class SheetsService {
  private readonly sheets = [
    { id: 1, title: 'Sinfonía en Do', type: 'pdf', owner: 'Orquesta Nacional' },
    { id: 2, title: 'Concierto para violín', type: 'musicxml', owner: 'Sala de Cámara' },
  ];

  findAll() {
    return this.sheets;
  }

  create(payload: { title: string; type: string; owner: string }) {
    const sheet = { id: Date.now(), ...payload };
    this.sheets.push(sheet);
    return sheet;
  }
}
