import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { GroupMember } from './group-member.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 120 })
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('varchar', { default: 'ensemble' })
  type: string;

  @Column('varchar', { default: 'private' })
  visibility: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column('varchar', { length: 12, unique: true })
  join_code: string;

  @Column('boolean', { default: true })
  is_join_code_active: boolean;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
