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
   * Notificaciones del destinatario más los avisos globales (`user_id` nulo).
   * `userId` es obligatorio para que no exista una consulta sin filtrar.
   */
  async findAll(userId: string): Promise<Notification[]> {
    return await this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId OR n.userId IS NULL', { userId })
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

    // Las notificaciones sin destinatario son avisos globales (ensayos,
    // partituras) y las ve todo el mundo; el resto sólo su dueño.
    const isBroadcast = notification.userId === null || notification.userId === undefined;
    if (!isBroadcast && notification.userId !== userId) {
      throw new ForbiddenException('No podés modificar notificaciones de otro usuario.');
    }

    notification.read = true;
    await this.notificationRepository.save(notification);
    return { success: true, id };
  }

  /**
   * Marca como leídas las notificaciones del usuario autenticado (más los avisos
   * globales). `userId` es obligatorio: sin filtro, la sentencia UPDATE alcanzaba
   * a las notificaciones de todos los usuarios.
   *
   * Nota: `where(...)` opera sobre nombres de COLUMNA (no de propiedad), de ahí
   * `user_id` en lugar de `userId`.
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean; count: number }> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('read = :read', { read: false })
      .andWhere('(user_id = :userId OR user_id IS NULL)', { userId })
      .execute();

    return { success: true, count: result.affected || 0 };
  }

  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);

    // Eliminar afecta a todos los usuarios en el caso de los avisos globales,
    // por eso sólo puede hacerlo el destinatario de la notificación.
    if (notification.userId !== userId) {
      throw new ForbiddenException('No podés eliminar notificaciones de otro usuario.');
    }

    await this.notificationRepository.remove(notification);
    return { success: true };
  }
}
