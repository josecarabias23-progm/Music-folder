import { Controller, Get, Patch, Delete, Param, Body, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

/**
 * Campos que un cliente puede declarar al crear una notificación propia.
 * `id`, `userId` y los timestamps los fija el servidor.
 */
interface CreateNotificationBody {
  type: Notification['type'];
  title: string;
  message: string;
  targetId?: string;
  metadata?: Record<string, any>;
  read?: boolean;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** Sólo las notificaciones del usuario autenticado (antes: `?userId=` libre). */
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser): Promise<Notification[]> {
    return await this.notificationsService.findAll(user.id);
  }

  @Post()
  async create(
    @Body() payload: CreateNotificationBody,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Notification> {
    return await this.notificationsService.create({
      ...payload,
      userId: user.id,
      read: payload.read ?? false,
    });
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    // Antes, sin `userId`, esta acción marcaba como leídas las notificaciones
    // de TODOS los usuarios (la columna quedaba sin filtrar).
    return await this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return await this.notificationsService.markAsRead(id, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return await this.notificationsService.remove(id, user.id);
  }
}
