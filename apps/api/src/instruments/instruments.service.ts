import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument } from './entities/instrument.entity';

export interface InstrumentItem {
  id: string;
  name: string;
  family: 'Cuerdas' | 'Viento madera' | 'Viento metal' | 'Percusión' | 'Teclado' | string;
  icon: string;
  clef?: string;
  transposition?: string;
  description?: string;
}

const FAMILY_MAP: Record<string, string> = {
  strings: 'Cuerdas',
  winds: 'Viento madera',
  brass: 'Viento metal',
  percussion: 'Percusión',
  keyboard: 'Teclado',
};

const ICON_MAP: Record<string, string> = {
  violin: '♩',
  violonchelo: '♭',
  flauta: '♬',
  trompa: '♮',
  timbales: '◒',
  arpa: '𝄞',
};

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(Instrument)
    private readonly instrumentRepository: Repository<Instrument>,
  ) {}

  private mapEntityToItem(item: Instrument): InstrumentItem {
    const familyDisplay = FAMILY_MAP[item.family] || item.family;
    const iconDisplay = ICON_MAP[item.id] || '𝄞';
    const clefDisplay = Array.isArray(item.clef) ? item.clef.join(' / ') : item.clef || '';

    return {
      id: item.id,
      name: item.name,
      family: familyDisplay,
      icon: iconDisplay,
      clef: clefDisplay,
      transposition: item.transposition,
      description: item.historical_info || item.maintenance_tips || '',
    };
  }

  async findAll(): Promise<InstrumentItem[]> {
    const instruments = await this.instrumentRepository.find();
    return instruments.map((inst) => this.mapEntityToItem(inst));
  }

  async findOne(id: string): Promise<InstrumentItem> {
    const instrument = await this.instrumentRepository.findOne({
      where: { id },
    });
    if (!instrument) {
      throw new NotFoundException(`Instrument ${id} not found`);
    }
    return this.mapEntityToItem(instrument);
  }
}

