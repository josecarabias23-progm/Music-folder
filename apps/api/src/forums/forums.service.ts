import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ForumsService {
  private readonly threads = [
    { id: 1, title: 'Cómo preparar una audición', posts: 4 },
    { id: 2, title: 'Mantenimiento de instrumentos', posts: 2 },
  ];

  findAll() {
    return this.threads;
  }

  create(payload: { title: string }) {
    const thread = { id: Date.now(), title: payload.title, posts: 0 };
    this.threads.push(thread);
    return thread;
  }

  findOne(id: string) {
    const thread = this.threads.find((item) => String(item.id) === id);
    if (!thread) throw new NotFoundException(`Forum thread ${id} not found`);
    return thread;
  }
}
