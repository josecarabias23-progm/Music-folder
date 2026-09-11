import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Group } from './group.entity';

@Entity('group_library_items')
export class GroupLibraryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('varchar', { default: 'score' })
  type: string;

  @Column('text', { nullable: true })
  file_url: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploaded_by: User | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
