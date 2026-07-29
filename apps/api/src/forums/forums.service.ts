import { Injectable, NotFoundException } from '@nestjs/common';

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
  category: 'Repertorio' | 'Técnica' | 'Recursos' | 'Gestión';
  likes: number;
  comments: ForumComment[];
}

@Injectable()
export class ForumsService {
  private readonly threads: ForumThread[] = [
    {
      id: '1',
      title: 'Recomendaciones para programar música latinoamericana',
      author: 'Valentina Ruiz',
      meta: 'Hace 2 h',
      category: 'Repertorio',
      likes: 15,
      comments: [
        { id: 'c1', author: 'Martín López', date: 'Hace 1 h', content: 'Recomiendo incluir piezas de Arturo Márquez y Silvestre Revueltas.' },
        { id: 'c2', author: 'Elena Torres', date: 'Hace 30 min', content: 'También los arreglos de Piazzolla para cuerdas funcionan excelentemente.' },
      ],
    },
    {
      id: '2',
      title: '¿Cómo trabajan las dinámicas en seccionales?',
      author: 'Martín López',
      meta: 'Ayer',
      category: 'Técnica',
      likes: 8,
      comments: [
        { id: 'c3', author: 'Carlos Mendonça', date: 'Ayer', content: 'Usamos afinadores con espectrómetro y metrónomo subdividido.' },
      ],
    },
    {
      id: '3',
      title: 'Recursos para preparar una audición de violín',
      author: 'Elena Torres',
      meta: 'Hace 2 días',
      category: 'Recursos',
      likes: 24,
      comments: [],
    },
  ];

  findAll() {
    return this.threads;
  }

  create(payload: Partial<ForumThread>) {
    const thread: ForumThread = {
      id: String(Date.now()),
      title: payload.title || 'Nueva conversación',
      author: payload.author || 'Usuario',
      meta: 'Hace un momento',
      category: (payload.category as any) || 'Repertorio',
      likes: 0,
      comments: [],
    };
    this.threads.unshift(thread);
    return thread;
  }

  findOne(id: string) {
    const thread = this.threads.find((item) => String(item.id) === id);
    if (!thread) throw new NotFoundException(`Forum thread ${id} not found`);
    return thread;
  }

  addComment(threadId: string, author: string, content: string) {
    const thread = this.findOne(threadId);
    const comment: ForumComment = {
      id: String(Date.now()),
      author: author || 'Músico',
      date: 'Hace un momento',
      content,
    };
    thread.comments.push(comment);
    return thread;
  }

  like(threadId: string) {
    const thread = this.findOne(threadId);
    thread.likes += 1;
    return thread;
  }
}

