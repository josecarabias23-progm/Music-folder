import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Group } from './group.entity';

@Entity('group_rehearsals')
export class GroupRehearsal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('varchar', { nullable: true })
  date: string | null;

  @Column('varchar', { nullable: true })
  time: string | null;

  @Column('varchar', { nullable: true })
  location: string | null;

  @Column('text', { nullable: true })
  agenda: string | null;

  @Column('text', { nullable: true })
  notes: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  created_by: User | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
