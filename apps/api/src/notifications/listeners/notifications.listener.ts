import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { RehearsalScheduledEvent } from '../events/rehearsal-scheduled.event';
import { SheetUploadedEvent } from '../events/sheet-uploaded.event';
import { AttendanceMarkedEvent } from '../events/attendance-marked.event';

@Injectable()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('rehearsal.scheduled')
  async handleRehearsalScheduled(event: RehearsalScheduledEvent) {
    await this.notificationsService.create({
      type: 'rehearsal_scheduled',
      title: event.title,
      message: `${event.date || 'Mañana a las 10:00 AM'} - ${event.venue || 'Sala Principal'}`,
      targetId: event.rehearsalId,
      metadata: {
        date: `${event.date} · ${event.time}`,
        venue: event.venue,
        author: event.author || 'Dirección Musical',
      },
    });
  }

  @OnEvent('sheet.uploaded')
  async handleSheetUploaded(event: SheetUploadedEvent) {
    await this.notificationsService.create({
      type: 'sheet_uploaded',
      title: `${event.title} - ${event.composer}`,
      message: `Partituras actualizadas. ${event.ensemble}`,
      targetId: event.sheetId,
      metadata: {
        ensemble: event.ensemble,
        author: event.uploader || 'Archivista',
      },
    });
  }

  @OnEvent('attendance.marked')
  async handleAttendanceMarked(event: AttendanceMarkedEvent) {
    await this.notificationsService.create({
      userId: event.userId,
      type: 'attendance_marked',
      title: `Asistencia Registrada: ${event.status.toUpperCase()}`,
      message: event.rehearsalTitle,
      targetId: event.rehearsalId,
      metadata: {
        status: event.status,
        date: event.date || 'Ayer',
        author: event.userName,
      },
    });
  }
}
