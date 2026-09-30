import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Group } from '../../groups/entities/group.entity';

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

  @Column('varchar', { name: 'group_id', nullable: true })
  group_id: string | null;

  @ManyToOne(() => Group, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'group_id' })
  group?: Group | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
