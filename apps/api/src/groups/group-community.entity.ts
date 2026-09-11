import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Group } from './entities/group.entity';

@Entity('group_community_posts')
export class GroupCommunityPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('text')
  content: string;

  @Column('varchar', { default: 'group' })
  visibility: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
