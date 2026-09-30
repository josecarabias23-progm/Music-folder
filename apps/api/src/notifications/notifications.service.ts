import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Notificaciones estrictamente privadas del destinatario.
   * `userId` es obligatorio para que no exista una consulta sin filtrar.
   */
  async findAll(userId: string): Promise<Notification[]> {
    if (!userId) return [];
    return await this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .getMany();
  }

  async create(payload: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(payload);
    return await this.notificationRepository.save(notification);
  }

  async markAsRead(id: string, userId: string): Promise<{ success: boolean; id: string }> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);

    if (notification.userId !== userId) {
      throw new ForbiddenException('No podés modificar notificaciones de otro usuario.');
    }

    notification.read = true;
    await this.notificationRepository.save(notification);
    return { success: true, id };
  }

  /**
   * Marca como leídas las notificaciones privadas del usuario autenticado.
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean; count: number }> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('read = :read', { read: false })
      .andWhere('user_id = :userId', { userId })
      .execute();

    return { success: true, count: result.affected || 0 };
  }

  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);

    if (notification.userId !== userId) {
      throw new ForbiddenException('No podés eliminar notificaciones de otro usuario.');
    }

    await this.notificationRepository.remove(notification);
    return { success: true };
  }
}
