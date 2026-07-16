import { Injectable } from '@nestjs/common';

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
}
