import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ForumComment } from './forum-comment.entity';

@Entity('forum_threads')
export class ForumThread {
  @PrimaryColumn('varchar')
  id: string = uuid();

  @Column('varchar')
  title: string;

  @Column('varchar')
  author: string;

  @Column('varchar', { nullable: true })
  meta: string | null;

  @Column('varchar', { nullable: true })
  category: string | null;

  @Column('int', { default: 0 })
  likes: number;

  @OneToMany(() => ForumComment, (comment) => comment.thread)
  comments: ForumComment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
