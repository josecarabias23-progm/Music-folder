import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity('users')
export class User {
  @PrimaryColumn('varchar')
  id: string = uuid();

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { unique: true, nullable: true })
  username: string;

  @Column('varchar', { nullable: true })
  password_hash: string;

  @Column('varchar', { nullable: true })
  first_name: string;

  @Column('varchar', { nullable: true })
  last_name: string;

  @Column('varchar', { nullable: true })
  bio: string;

  @Column('varchar', { nullable: true })
  profile_picture_url: string;

  @Column('varchar', { nullable: true })
  role: string;

  @Column('varchar', { nullable: true })
  instrument_primary: string;

  @Column('varchar', { nullable: true })
  instrument_secondary: string;

  @Column('boolean', { default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
