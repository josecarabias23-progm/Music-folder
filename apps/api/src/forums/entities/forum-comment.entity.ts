import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ForumThread } from './forum-thread.entity';

@Entity('forum_comments')
export class ForumComment {
  @PrimaryColumn('varchar')
  id: string = uuid();

  @Column('varchar', { name: 'thread_id' })
  thread_id: string;

  @Column('varchar')
  author: string;

  @Column('varchar', { nullable: true })
  date_text: string | null;

  @Column('text')
  content: string;

  @ManyToOne(() => ForumThread, (thread) => thread.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: ForumThread;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
