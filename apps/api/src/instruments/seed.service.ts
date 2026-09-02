import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument, InstrumentFamilyEnum } from './entities/instrument.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class InstrumentsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InstrumentsSeedService.name);

  constructor(
    @InjectRepository(Instrument)
    private readonly instrumentRepository: Repository<Instrument>,
  ) {}

  async onApplicationBootstrap() {
    // Run on app bootstrap in case the app is started normally
    try {
      await this.seed();
    } catch (err) {
      this.logger.error('Error running instruments seed on bootstrap', err as any);
    }
  }

  async seed(): Promise<void> {
    const count = await this.instrumentRepository.count();
    if (count > 0) {
      this.logger.log('Instruments table already has data, skipping seed.');
      return;
    }

    const items: Partial<Instrument>[] = [
      {
        id: 'violin',
        name: 'Violín',
        family: InstrumentFamilyEnum.STRINGS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'G3', highest_note: 'A7' },
        concert_range: { lowest_note: 'G3', highest_note: 'A7' },
        clef: ['treble'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['arco', 'pizzicato', 'spiccato'],
      },
      {
        id: 'viola',
        name: 'Viola',
        family: InstrumentFamilyEnum.STRINGS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'C3', highest_note: 'A6' },
        concert_range: { lowest_note: 'C3', highest_note: 'A6' },
        clef: ['alto'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['arco', 'pizzicato'],
      },
      {
        id: 'cello',
        name: 'Violonchelo',
        family: InstrumentFamilyEnum.STRINGS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'C2', highest_note: 'C6' },
        concert_range: { lowest_note: 'C2', highest_note: 'C6' },
        clef: ['bass', 'tenor', 'treble'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['arco', 'pizzicato'],
      },
      {
        id: 'double_bass',
        name: 'Contrabajo',
        family: InstrumentFamilyEnum.STRINGS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'E1', highest_note: 'C5' },
        concert_range: { lowest_note: 'E1', highest_note: 'C5' },
        clef: ['bass'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['arco', 'pizzicato'],
      },
      {
        id: 'flute',
        name: 'Flauta',
        family: InstrumentFamilyEnum.WINDS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'C4', highest_note: 'C7' },
        concert_range: { lowest_note: 'C4', highest_note: 'C7' },
        clef: ['treble'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['tonguing', 'trill'],
      },
      {
        id: 'oboe',
        name: 'Oboe',
        family: InstrumentFamilyEnum.WINDS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'B3', highest_note: 'A6' },
        concert_range: { lowest_note: 'B3', highest_note: 'A6' },
        clef: ['treble'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['double tonguing', 'trill'],
      },
      {
        id: 'clarinet',
        name: 'Clarinete',
        family: InstrumentFamilyEnum.WINDS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'E3', highest_note: 'C7' },
        concert_range: { lowest_note: 'E3', highest_note: 'C7' },
        clef: ['treble'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['overblowing', 'trill'],
      },
      {
        id: 'bassoon',
        name: 'Fagot',
        family: InstrumentFamilyEnum.WINDS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'B1', highest_note: 'E5' },
        concert_range: { lowest_note: 'B1', highest_note: 'E5' },
        clef: ['bass', 'tenor'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['tonguing', 'staccato'],
      },
      {
        id: 'trumpet',
        name: 'Trompeta',
        family: InstrumentFamilyEnum.BRASS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'F#3', highest_note: 'D6' },
        concert_range: { lowest_note: 'F#3', highest_note: 'D6' },
        clef: ['treble'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['muting', 'trill'],
      },
      {
        id: 'french_horn',
        name: 'Corno francés',
        family: InstrumentFamilyEnum.BRASS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'F#2', highest_note: 'C6' },
        concert_range: { lowest_note: 'F#2', highest_note: 'C6' },
        clef: ['treble'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['stopped horn', 'hand mute'],
      },
      {
        id: 'trombone',
        name: 'Trombón',
        family: InstrumentFamilyEnum.BRASS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'E2', highest_note: 'B4' },
        concert_range: { lowest_note: 'E2', highest_note: 'B4' },
        clef: ['bass', 'tenor'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['glissando', 'mute'],
      },
      {
        id: 'tuba',
        name: 'Tuba',
        family: InstrumentFamilyEnum.BRASS,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'D1', highest_note: 'F4' },
        concert_range: { lowest_note: 'D1', highest_note: 'F4' },
        clef: ['bass'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['staccato', 'legato'],
      },
      {
        id: 'percussion',
        name: 'Percusión',
        family: InstrumentFamilyEnum.PERCUSSION,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'C2', highest_note: 'C7' },
        concert_range: { lowest_note: 'C2', highest_note: 'C7' },
        clef: ['percussion'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['rolls', 'sticking'],
      },
      {
        id: 'piano',
        name: 'Piano',
        family: InstrumentFamilyEnum.KEYBOARD,
        transposition: undefined,
        is_transposing: false,
        range: { lowest_note: 'A0', highest_note: 'C8' },
        concert_range: { lowest_note: 'A0', highest_note: 'C8' },
        clef: ['treble', 'bass'],
        dynamic_range: { softest: 'pp', loudest: 'fff' },
        techniques: ['pedal', 'arpeggio'],
      },
    ];

    const toSave = items.map((it) => ({
      ...it,
      id: it.id || uuid(),
    })) as Instrument[];

    await this.instrumentRepository.save(toSave);
    this.logger.log(`Seeded ${toSave.length} instruments`);
  }
}
