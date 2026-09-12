import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum InstrumentFamilyEnum {
  STRINGS = 'strings',
  WINDS = 'winds',
  BRASS = 'brass',
  PERCUSSION = 'percussion',
  KEYBOARD = 'keyboard',
  ELECTRONIC = 'electronic',
}

@Entity('instruments')
export class Instrument {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  family: InstrumentFamilyEnum;

  @Column('varchar', { nullable: true })
  transposition: string;

  @Column('boolean', { default: false })
  is_transposing: boolean;

  @Column({ type: 'simple-json' })
  range: {
    lowest_note: string;
    highest_note: string;
  };

  @Column({ type: 'simple-json' })
  concert_range: {
    lowest_note: string;
    highest_note: string;
  };

  @Column({ type: 'simple-json' })
  clef: string[];

  @Column({ type: 'simple-json' })
  dynamic_range: {
    softest: string;
    loudest: string;
  };

  @Column({ type: 'simple-json' })
  techniques: string[];

  @Column('text', { nullable: true })
  maintenance_tips: string;

  @Column('text', { nullable: true })
  historical_info: string;

  @Column({ type: 'simple-json', nullable: true })
  notable_repertoire: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
