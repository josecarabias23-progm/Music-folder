import { Injectable, NotFoundException } from '@nestjs/common';

export interface InstrumentItem {
  id: string;
  name: string;
  family: 'Cuerdas' | 'Viento madera' | 'Viento metal' | 'Percusión' | 'Teclado';
  icon: string;
  clef?: string;
  transposition?: string;
  description?: string;
}

@Injectable()
export class InstrumentsService {
  private readonly instruments: InstrumentItem[] = [
    { id: 'violin', name: 'Violín', family: 'Cuerdas', icon: '♩', clef: 'Sol (G)', transposition: 'En Do (no transpone)', description: 'Instrumento de cuerda frotada agudo, voz principal de la sección de cuerdas.' },
    { id: 'violonchelo', name: 'Violonchelo', family: 'Cuerdas', icon: '♭', clef: 'Fa (F) / Tenor', transposition: 'En Do (no transpone)', description: 'Instrumento de cuerda frotada grave de cálido timbre lírico.' },
    { id: 'flauta', name: 'Flauta traversa', family: 'Viento madera', icon: '♬', clef: 'Sol (G)', transposition: 'En Do (no transpone)', description: 'Instrumento de viento madera metálico con sonido brillante e agudo.' },
    { id: 'trompa', name: 'Trompa (Corno)', family: 'Viento metal', icon: '♮', clef: 'Sol / Fa', transposition: 'En Fa (suena 5ª justa abajo)', description: 'Instrumento de viento metal con timbre noble y gran rango dinámico.' },
    { id: 'timbales', name: 'Timbales', family: 'Percusión', icon: '◒', clef: 'Fa (F)', transposition: 'Afinación determinada', description: 'Set de tambores afinables por pedal, columna rítmica y armónica.' },
    { id: 'arpa', name: 'Arpa', family: 'Cuerdas', icon: '𝄞', clef: 'Sol / Fa', transposition: 'En Do (con pedales)', description: 'Instrumento de 47 cuerdas pulsadas y 7 pedales de afinación.' },
  ];

  findAll() {
    return this.instruments;
  }

  findOne(id: string) {
    const instrument = this.instruments.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!instrument) throw new NotFoundException(`Instrument ${id} not found`);
    return instrument;
  }
}

