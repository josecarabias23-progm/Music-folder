import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum SheetDifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional',
}

export enum SheetFileFormat {
  PDF = 'pdf',
  JPG = 'jpg',
  PNG = 'png',
  MUSICXML = 'musicxml',
}

@Entity('scores')
export class Sheet {
  @PrimaryColumn('uuid')
  id: string = uuid();

  @Column('varchar')
  title: string;

  @Column('varchar')
  composer: string;

  @Column('varchar', { nullable: true })
  arranger: string | null;

  @Column('uuid')
  owner_id: string;

  @Column('uuid', { nullable: true })
  organization_id: string | null;

  @Column('varchar')
  file_url: string;

  @Column('varchar')
  file_format: SheetFileFormat;

  @Column('bigint')
  file_size: number;

  @Column('varchar')
  instrument_role: string;

  @Column('varchar')
  key_signature: string;

  @Column('varchar')
  time_signature: string;

  @Column('int', { nullable: true })
  duration_minutes: number | null;

  @Column('varchar')
  difficulty_level: SheetDifficultyLevel;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('boolean', { default: false })
  is_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
