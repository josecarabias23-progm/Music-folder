import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findAll(userId?: string): Promise<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('n');
    if (userId) {
      query.where('n.userId = :userId OR n.userId IS NULL', { userId });
    }
    query.orderBy('n.createdAt', 'DESC');
    return await query.getMany();
  }

  async create(payload: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(payload);
    return await this.notificationRepository.save(notification);
  }

  async markAsRead(id: string): Promise<{ success: boolean; id: string }> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);

    notification.read = true;
    await this.notificationRepository.save(notification);
    return { success: true, id };
  }

  async markAllAsRead(userId?: string): Promise<{ success: boolean; count: number }> {
    const query = this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('read = :read', { read: false });

    if (userId) {
      query.andWhere('(userId = :userId OR userId IS NULL)', { userId });
    }

    const result = await query.execute();
    return { success: true, count: result.affected || 0 };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const result = await this.notificationRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Notification ${id} not found`);
    return { success: true };
  }
}
