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
  @PrimaryColumn('uuid')
  id: string = uuid();

  @Column('varchar')
  name: string;

  @Column('varchar')
  family: InstrumentFamilyEnum;

  @Column('varchar')
  transposition: string;

  @Column('boolean', { default: false })
  is_transposing: boolean;

  @Column('jsonb')
  range: {
    lowest_note: string;
    highest_note: string;
  };

  @Column('jsonb')
  concert_range: {
    lowest_note: string;
    highest_note: string;
  };

  @Column('simple-array')
  clef: string[];

  @Column('jsonb')
  dynamic_range: {
    softest: string;
    loudest: string;
  };

  @Column('simple-array')
  techniques: string[];

  @Column('text')
  maintenance_tips: string;

  @Column('text')
  historical_info: string;

  @Column('simple-array', { nullable: true })
  notable_repertoire: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
