import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumThread as ForumThreadEntity } from './entities/forum-thread.entity';
import { ForumComment as ForumCommentEntity } from './entities/forum-comment.entity';

export interface ForumComment {
  id: string;
  author: string;
  date: string;
  content: string;
}

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  meta: string;
  category: 'Repertorio' | 'Técnica' | 'Recursos' | 'Gestión' | string;
  likes: number;
  comments: ForumComment[];
}

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(ForumThreadEntity)
    private readonly threadRepository: Repository<ForumThreadEntity>,
    @InjectRepository(ForumCommentEntity)
    private readonly commentRepository: Repository<ForumCommentEntity>,
  ) {}

  private mapEntityToThread(entity: ForumThreadEntity): ForumThread {
    return {
      id: entity.id,
      title: entity.title,
      author: entity.author,
      meta: entity.meta || 'Reciente',
      category: entity.category || 'Repertorio',
      likes: entity.likes || 0,
      comments: (entity.comments || []).map((c) => ({
        id: c.id,
        author: c.author,
        date: c.date_text || 'Hace un momento',
        content: c.content,
      })),
    };
  }

  async findAll(): Promise<ForumThread[]> {
    const threads = await this.threadRepository.find({
      relations: ['comments'],
      order: { created_at: 'DESC' },
    });
    return threads.map((t) => this.mapEntityToThread(t));
  }

  async create(payload: Partial<ForumThread>): Promise<ForumThread> {
    const thread = this.threadRepository.create({
      title: payload.title || 'Nueva conversación',
      author: payload.author || 'Usuario',
      meta: 'Hace un momento',
      category: payload.category || 'Repertorio',
      likes: 0,
    });
    const saved = await this.threadRepository.save(thread);
    saved.comments = [];
    return this.mapEntityToThread(saved);
  }

  async findOne(id: string): Promise<ForumThread> {
    const thread = await this.threadRepository.findOne({
      where: { id },
      relations: ['comments'],
    });
    if (!thread) throw new NotFoundException(`Forum thread ${id} not found`);
    return this.mapEntityToThread(thread);
  }

  async addComment(threadId: string, author: string, content: string): Promise<ForumThread> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      relations: ['comments'],
    });
    if (!thread) throw new NotFoundException(`Forum thread ${threadId} not found`);

    const comment = this.commentRepository.create({
      thread_id: threadId,
      author: author || 'Músico',
      date_text: 'Hace un momento',
      content,
    });
    await this.commentRepository.save(comment);

    return this.findOne(threadId);
  }

  async like(threadId: string): Promise<ForumThread> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      relations: ['comments'],
    });
    if (!thread) throw new NotFoundException(`Forum thread ${threadId} not found`);

    thread.likes += 1;
    await this.threadRepository.save(thread);
    return this.mapEntityToThread(thread);
  }
}

