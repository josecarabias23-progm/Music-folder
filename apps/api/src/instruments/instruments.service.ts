import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class InstrumentsService {
  private readonly instruments = [
    { id: 'violin', name: 'Violín', family: 'Cuerdas' },
    { id: 'trumpet', name: 'Trompeta', family: 'Viento metal' },
    { id: 'flute', name: 'Flauta', family: 'Viento madera' },
  ];

  findAll() {
    return this.instruments;
  }

  findOne(id: string) {
    const instrument = this.instruments.find((item) => item.id === id);
    if (!instrument) throw new NotFoundException(`Instrument ${id} not found`);
    return instrument;
  }
}
