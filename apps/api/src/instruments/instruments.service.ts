import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstrumentDto, UpdateInstrumentDto } from './dto/create-instrument.dto';
import { Instrument, InstrumentFamilyEnum } from './entities/instrument.entity';
import { v4 as uuid } from 'uuid';

/**
 * InstrumentsService
 * Implements business logic for instruments encyclopedia management
 * 
 * Based on spec: openspec/specs/api-endpoints.md - Module 2: Instruments
 * Data models: openspec/specs/data-models.md - Entity: Instrument
 */
@Injectable()
export class InstrumentsService {
  // Mock in-memory storage (will be replaced with TypeORM repository)
  private instruments: Map<string, Instrument> = new Map();

  constructor() {
    // TODO: Remove mock data after database integration and seeder
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockInstruments = [
      {
        name: 'Violin',
        family: InstrumentFamilyEnum.STRINGS,
        transposition: 'C',
        is_transposing: false,
        range: { lowest_note: 'G3', highest_note: 'E7' },
        concert_range: { lowest_note: 'G3', highest_note: 'E7' },
        clef: ['treble'],
        dynamic_range: { softest: 'ppp', loudest: 'fff' },
        techniques: ['vibrato', 'tremolo', 'pizzicato', 'harmonics'],
        maintenance_tips: 'Store in case with proper humidity. Keep strings clean.',
        historical_info: 'The violin emerged in Italy during the 16th century.',
        notable_repertoire: ['Violin Concerto in D', 'The Four Seasons'],
      },
      {
        name: 'Trumpet',
        family: InstrumentFamilyEnum.BRASS,
        transposition: 'B♭',
        is_transposing: true,
        range: { lowest_note: 'E3', highest_note: 'B5' },
        concert_range: { lowest_note: 'D3', highest_note: 'A5' },
        clef: ['treble'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['flutter-tongue', 'half-valve', 'mute'],
        maintenance_tips: 'Oil valves regularly. Keep mouthpiece clean.',
        historical_info: 'The modern trumpet evolved from the natural trumpet in the 19th century.',
        notable_repertoire: ['Hummel Trumpet Concerto', 'Arutiunian Concerto'],
      },
      {
        name: 'Cello',
        family: InstrumentFamilyEnum.STRINGS,
        transposition: 'C',
        is_transposing: false,
        range: { lowest_note: 'C2', highest_note: 'D6' },
        concert_range: { lowest_note: 'C2', highest_note: 'D6' },
        clef: ['bass', 'tenor', 'treble'],
        dynamic_range: { softest: 'ppp', loudest: 'fff' },
        techniques: ['vibrato', 'pizzicato', 'col legno', 'harmonics'],
        maintenance_tips: 'Store vertically. Maintain proper humidity levels.',
        historical_info: 'The cello evolved from the viola da gamba in the 16th century.',
        notable_repertoire: ['Bach Suites', 'Elgar Concerto', 'Dvorák Concerto'],
      },
    ];

    mockInstruments.forEach((instrument) => {
      const inst = new Instrument();
      inst.id = uuid();
      inst.name = instrument.name;
      inst.family = instrument.family;
      inst.transposition = instrument.transposition;
      inst.is_transposing = instrument.is_transposing;
      inst.range = instrument.range;
      inst.concert_range = instrument.concert_range;
      inst.clef = instrument.clef;
      inst.dynamic_range = instrument.dynamic_range;
      inst.techniques = instrument.techniques;
      inst.maintenance_tips = instrument.maintenance_tips;
      inst.historical_info = instrument.historical_info;
      inst.notable_repertoire = instrument.notable_repertoire;
      inst.created_at = new Date();
      inst.updated_at = new Date();

      this.instruments.set(inst.id, inst);
    });
  }

  /**
   * Create a new instrument (POST /instruments)
   * Spec: openspec/specs/api-endpoints.md #2.3
   * Note: Admin only in production
   */
  async create(createInstrumentDto: CreateInstrumentDto): Promise<Instrument> {
    const instrument = new Instrument();
    instrument.id = uuid();
    instrument.name = createInstrumentDto.name;
    instrument.family = createInstrumentDto.family;
    instrument.transposition = createInstrumentDto.transposition;
    instrument.is_transposing = createInstrumentDto.is_transposing;
    instrument.range = createInstrumentDto.range;
    instrument.concert_range = createInstrumentDto.concert_range;
    instrument.clef = createInstrumentDto.clef;
    instrument.dynamic_range = createInstrumentDto.dynamic_range;
    instrument.techniques = createInstrumentDto.techniques;
    instrument.maintenance_tips = createInstrumentDto.maintenance_tips;
    instrument.historical_info = createInstrumentDto.historical_info;
    instrument.notable_repertoire = createInstrumentDto.notable_repertoire || [];
    instrument.created_at = new Date();
    instrument.updated_at = new Date();

    this.instruments.set(instrument.id, instrument);
    return instrument;
  }

  /**
   * List all instruments with filters (GET /instruments)
   * Spec: openspec/specs/api-endpoints.md #2.1
   */
  async findAll(
    filters?: {
      family?: string;
      transposing?: boolean;
      search?: string;
    },
    skip: number = 0,
    limit: number = 20,
  ): Promise<{
    data: Instrument[];
    pagination: { total: number; skip: number; limit: number };
  }> {
    let filtered = Array.from(this.instruments.values());

    // Apply filters
    if (filters?.family) {
      filtered = filtered.filter((i) => i.family === filters.family);
    }
    if (filters?.transposing !== undefined) {
      filtered = filtered.filter((i) => i.is_transposing === filters.transposing);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((i) => i.name.toLowerCase().includes(search));
    }

    // Apply pagination
    const total = filtered.length;
    const data = filtered.slice(skip, skip + limit);

    return {
      data,
      pagination: { total, skip, limit },
    };
  }

  /**
   * Get a single instrument by ID (GET /instruments/:id)
   * Spec: openspec/specs/api-endpoints.md #2.2
   */
  async findOne(id: string): Promise<Instrument> {
    const instrument = this.instruments.get(id);
    if (!instrument) {
      throw new NotFoundException(`Instrument with ID ${id} not found`);
    }
    return instrument;
  }

  /**
   * Update instrument (PATCH /instruments/:id)
   * Spec: openspec/specs/api-endpoints.md #2.4
   * Note: Admin only in production
   */
  async update(id: string, updateInstrumentDto: UpdateInstrumentDto): Promise<Instrument> {
    const instrument = await this.findOne(id);

    Object.assign(instrument, updateInstrumentDto, {
      updated_at: new Date(),
    });

    this.instruments.set(id, instrument);
    return instrument;
  }

  /**
   * Delete instrument (DELETE /instruments/:id)
   * Note: Admin only, not documented in initial spec
   */
  async remove(id: string): Promise<void> {
    const exists = this.instruments.has(id);
    if (!exists) {
      throw new NotFoundException(`Instrument with ID ${id} not found`);
    }
    this.instruments.delete(id);
  }
}
