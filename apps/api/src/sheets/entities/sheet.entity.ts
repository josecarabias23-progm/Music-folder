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
  @PrimaryColumn('varchar')
  id: string = uuid();

  @Column('varchar')
  title: string;

  @Column('varchar')
  composer: string;

  @Column('varchar', { nullable: true })
  arranger: string | null;

  @Column('varchar', { nullable: true })
  owner_id: string | null;

  @Column('varchar', { nullable: true })
  organization_id: string | null;

  @Column('varchar', { nullable: true })
  file_url: string | null;

  @Column('varchar', { nullable: true })
  file_format: SheetFileFormat | string | null;

  @Column('bigint', { nullable: true })
  file_size: number | null;

  @Column('varchar', { nullable: true })
  instrument_role: string | null;

  @Column('varchar', { nullable: true })
  key_signature: string | null;

  @Column('varchar', { nullable: true })
  time_signature: string | null;

  @Column('int', { nullable: true })
  duration_minutes: number | null;

  @Column('varchar', { nullable: true })
  difficulty_level: SheetDifficultyLevel | string | null;

  @Column('jsonb', { nullable: true })
  tags: string[] | null;

  @Column('boolean', { default: false })
  is_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
