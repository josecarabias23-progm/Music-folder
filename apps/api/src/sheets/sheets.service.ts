import { Injectable, NotFoundException } from '@nestjs/common';

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
  private readonly sheets: ScoreItem[] = [
    { id: '1', title: 'Sinfonía n.º 5', composer: 'L. van Beethoven', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Avanzado', isFavorite: true, type: 'pdf', owner: 'Orquesta Principal' },
    { id: '2', title: 'Danzón n.º 2', composer: 'Arturo Márquez', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Intermedio', isFavorite: true, type: 'pdf', owner: 'Orquesta Principal' },
    { id: '3', title: 'Las cuatro estaciones', composer: 'A. Vivaldi', ensemble: 'Cuerdas', category: 'Cámara', difficulty: 'Intermedio', isFavorite: false, type: 'musicxml', owner: 'Sección Cuerdas' },
    { id: '4', title: 'El amor brujo', composer: 'M. de Falla', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Avanzado', isFavorite: false, type: 'pdf', owner: 'Orquesta Principal' },
    { id: '5', title: 'Clair de Lune', composer: 'C. Debussy', ensemble: 'Piano solo', category: 'Solista', difficulty: 'Fácil', isFavorite: true, type: 'pdf', owner: 'Solistas' },
    { id: '6', title: 'Suite Holberg', composer: 'E. Grieg', ensemble: 'Cuerdas', category: 'Cámara', difficulty: 'Intermedio', isFavorite: false, type: 'pdf', owner: 'Sección Cuerdas' },
  ];

  findAll() {
    return this.sheets;
  }

  create(payload: Partial<ScoreItem>) {
    const sheet: ScoreItem = {
      id: String(Date.now()),
      title: payload.title || 'Nueva Obra',
      composer: payload.composer || 'Anónimo',
      ensemble: payload.ensemble || 'Orquesta completa',
      category: (payload.category as any) || 'Orquesta',
      difficulty: payload.difficulty || 'Intermedio',
      isFavorite: payload.isFavorite || false,
      type: payload.type || 'pdf',
      owner: payload.owner || 'Usuario',
    };
    this.sheets.unshift(sheet);
    return sheet;
  }

  findOne(id: string) {
    const sheet = this.sheets.find((item) => String(item.id) === id);
    if (!sheet) throw new NotFoundException(`Sheet ${id} not found`);
    return sheet;
  }

  update(id: string, payload: Partial<ScoreItem>) {
    const sheet = this.findOne(id);
    Object.assign(sheet, payload);
    return sheet;
  }

  remove(id: string) {
    const index = this.sheets.findIndex((item) => String(item.id) === id);
    if (index < 0) throw new NotFoundException(`Sheet ${id} not found`);
    this.sheets.splice(index, 1);
    return { success: true };
  }
}
