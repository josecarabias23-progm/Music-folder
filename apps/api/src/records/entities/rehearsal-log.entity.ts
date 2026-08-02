import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity('rehearsal_logs')
export class RehearsalLog {
  @PrimaryColumn('varchar')
  id: string = uuid();

  @Column('varchar')
  title: string;

  @Column('varchar', { nullable: true })
  type: string | null;

  @Column('varchar', { nullable: true })
  date_text: string | null;

  @Column('varchar', { nullable: true })
  time_text: string | null;

  @Column('varchar', { nullable: true })
  venue: string | null;

  @Column('int', { nullable: true })
  attendees_count: number | null;

  @Column('text', { nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
