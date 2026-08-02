import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument } from './entities/instrument.entity';

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(Instrument)
    private readonly instrumentsRepository: Repository<Instrument>,
  ) {}

  async findAll() {
    return this.instrumentsRepository.find();
  }

  async findOne(id: string) {
    const instrument = await this.instrumentsRepository.findOne({ where: { id } });
    if (!instrument) throw new NotFoundException(`Instrument ${id} not found`);
    return instrument;
  }
}

