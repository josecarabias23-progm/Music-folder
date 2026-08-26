import { Controller, Get, Patch, Delete, Param, Query, Body, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Query('userId') userId?: string): Promise<Notification[]> {
    return await this.notificationsService.findAll(userId);
  }

  @Post()
  async create(@Body() payload: Partial<Notification>): Promise<Notification> {
    return await this.notificationsService.create(payload);
  }

  @Patch('read-all')
  async markAllAsRead(@Query('userId') userId?: string) {
    return await this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return await this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.notificationsService.remove(id);
  }
}
