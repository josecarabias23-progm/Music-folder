import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumComment } from './entities/forum-comment.entity';
import { ForumThread } from './entities/forum-thread.entity';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(ForumThread)
    private readonly threadRepository: Repository<ForumThread>,
    @InjectRepository(ForumComment)
    private readonly commentRepository: Repository<ForumComment>,
  ) {}

  async findAll() {
    return this.threadRepository.find({ relations: ['comments'] });
  }

  async create(payload: Partial<ForumThread>) {
    const thread = this.threadRepository.create({
      title: payload.title || 'Nueva conversación',
      author: payload.author || 'Usuario',
      meta: 'Hace un momento',
      category: payload.category || 'Repertorio',
      likes: 0,
    });

    return this.threadRepository.save(thread);
  }

  async findOne(id: string) {
    const thread = await this.threadRepository.findOne({ where: { id }, relations: ['comments'] });
    if (!thread) throw new NotFoundException(`Forum thread ${id} not found`);
    return thread;
  }

  async addComment(threadId: string, author: string, content: string) {
    const thread = await this.findOne(threadId);
    const comment = this.commentRepository.create({
      author: author || 'Músico',
      date_text: 'Hace un momento',
      content,
      thread,
    });
    await this.commentRepository.save(comment);
    return this.findOne(threadId);
  }

  async like(threadId: string) {
    const thread = await this.findOne(threadId);
    thread.likes += 1;
    return this.threadRepository.save(thread);
  }
}

