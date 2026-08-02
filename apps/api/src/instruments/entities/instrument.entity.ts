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
  id: string = uuid();

  @Column('varchar')
  name: string;

  @Column('varchar')
  family: InstrumentFamilyEnum;

  @Column('varchar')
  transposition: string;

  @Column('boolean', { default: false })
  is_transposing: boolean;

  @Column('text', { name: 'range_json' })
  range: string;

  @Column('text', { name: 'concert_range_json' })
  concert_range: string;

  @Column('text', { name: 'clef_json' })
  clef: string;

  @Column('text', { name: 'dynamic_range_json' })
  dynamic_range: string;

  @Column('text', { name: 'techniques_json' })
  techniques: string;

  @Column('text')
  maintenance_tips: string;

  @Column('text')
  historical_info: string;

  @Column('text', { name: 'notable_repertoire_json', nullable: true })
  notable_repertoire: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
