import { Injectable, NotFoundException } from '@nestjs/common';

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

  findOne(id: string) {
    const sheet = this.sheets.find((item) => String(item.id) === id);
    if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);
    return sheet;
  }

  update(id: string, payload: Partial<{ title: string; type: string; owner: string }>) {
    const sheet = this.findOne(id);
    Object.assign(sheet, payload);
    return sheet;
  }

  remove(id: string) {
    const index = this.sheets.findIndex((item) => String(item.id) === id);
    if (index < 0) throw new NotFoundException(`Sheet ${id} not found`);
    this.sheets.splice(index, 1);
  }
}
