# Change #3: Notifications System & Event-Driven Alerts

## Summary
Design and document the complete Notifications System for Music Folder, incorporating the frontend UI Notification Center (top bar popover bell dropdown, filter tabs, read/unread states, and floating toast alerts) and creating the complete NestJS backend infrastructure to automatically emit notifications when:
1. **Un ensayo es agendado** (`rehearsal.scheduled`)
2. **Una partitura es subida** (`sheet.uploaded`)
3. **Se registra la asistencia de un músico** (`attendance.marked`)

---

## What & Why

### Problem Statement
In musical ensembles (orchestras, bands, choirs, chamber groups), musicians and directors need immediate visibility when rehearsal schedules change, when new sheet music is published, or when attendance is logged. Without real-time notifications, members miss updates, bring wrong scores, or fail to confirm attendance on time.

### Goals
1. ✅ **Frontend Notification Center UI**: Implement a bell dropdown with unread badge counter, category filters (`Todas`, `Ensayos`, `Partituras`, `Asistencia`), action to mark all as read, and floating toast notifications.
2. ✅ **Notification Data Model**: Define `Notification` entity with TypeORM, JSONB metadata, read status, and relational targets.
3. ✅ **Event-Driven Backend Engine**: Integrate NestJS `EventEmitter2` so that domain actions (`RecordsService`, `SheetsService`) emit events that create notifications decoupled from core business logic.
4. ✅ **REST API Endpoints**: Implement `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`, `PATCH /api/v1/notifications/read-all`, and `DELETE /api/v1/notifications/:id`.
5. ✅ **Full E2E Integration**: Connect frontend React UI with mock/live NestJS endpoints.

### Non-Goals
- Push Notifications to iOS/Android native devices (Phase 3 Web Push / APNS/FCM).
- Email notifications dispatch (deferred to background worker task in Phase 3).

---

## Frontend Design & Integration (Implemented in Step 1)

### UI Components Created
1. **Header Notification Bell (`notification-bell-wrapper`)**:
   - Located in the application shell header (`apps/web/src/App.tsx`).
   - Displays unread counter badge with pulse animation (`notification-badge`).
   - Toggles the `NotificationPopover` dropdown.
2. **Notification Popover Dropdown (`notification-popover`)**:
   - Header with unread pill counter and "Marcar leídas ✓✓" button.
   - Filter pills: `Todas`, `🗓️ Ensayos`, `🎼 Partituras`, `✅ Asistencia`.
   - Card items with event type tag, timestamp, title, description, venue/ensemble metadata, and unread dot indicator.
3. **Rehearsal Detail Attendance Selector**:
   - Modal action buttons inside rehearsal modal (`selectedRecord`): `✓ Confirmar Presente`, `📝 Justificado`, `✕ Ausente`.
   - Generates an `attendance_marked` notification and displays a toast alert.
4. **Toast Notification System (`toast-notification`)**:
   - Floating banner at bottom-right corner when events are triggered.
   - Auto-dismisses after 4.5 seconds.

---

## Backend Technical Architecture (NestJS)

### Module Directory Structure
```
apps/api/src/notifications/
├── dto/
│   ├── create-notification.dto.ts
│   └── query-notification.dto.ts
├── entities/
│   └── notification.entity.ts
├── events/
│   ├── rehearsal-scheduled.event.ts
│   ├── sheet-uploaded.event.ts
│   └── attendance-marked.event.ts
├── listeners/
│   └── notifications.listener.ts
├── notifications.controller.ts
├── notifications.module.ts
└── notifications.service.ts
```

### 1. Entity Definition (`notification.entity.ts`)
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  type: 'rehearsal_scheduled' | 'sheet_uploaded' | 'attendance_marked';

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ name: 'target_id', type: 'uuid', nullable: true })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 2. Events & Listeners (`listeners/notifications.listener.ts`)
```typescript
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
      title: 'Nuevo ensayo agendado',
      message: `Se programó "${event.title}" para el ${event.date} en ${event.venue}.`,
      targetId: event.rehearsalId,
      metadata: {
        date: `${event.date} · ${event.time}`,
        venue: event.venue,
        author: event.author,
      },
    });
  }

  @OnEvent('sheet.uploaded')
  async handleSheetUploaded(event: SheetUploadedEvent) {
    await this.notificationsService.create({
      type: 'sheet_uploaded',
      title: 'Nueva partitura publicada',
      message: `Se ha publicado "${event.title}" de ${event.composer} para ${event.ensemble}.`,
      targetId: event.sheetId,
      metadata: {
        ensemble: event.ensemble,
        author: event.uploader,
      },
    });
  }

  @OnEvent('attendance.marked')
  async handleAttendanceMarked(event: AttendanceMarkedEvent) {
    await this.notificationsService.create({
      userId: event.userId,
      type: 'attendance_marked',
      title: 'Asistencia registrada',
      message: `${event.userName} confirmó asistencia como ${event.status.toUpperCase()} para el ensayo "${event.rehearsalTitle}".`,
      targetId: event.rehearsalId,
      metadata: {
        status: event.status,
        date: event.date,
        author: event.userName,
      },
    });
  }
}
```

---

## Tasks & Implementation Plan

### Phase 1: Frontend UI Place & Connection (Completed ✅)
- [x] **Task 1.1**: Define `NotificationItem` interface and API helper functions in `apps/web/src/api.ts`.
- [x] **Task 1.2**: Implement Notification Bell icon with unread count badge in header (`apps/web/src/App.tsx`).
- [x] **Task 1.3**: Build `NotificationPopover` dropdown with filter tabs (`Todas`, `Ensayos`, `Partituras`, `Asistencia`) and "Marcar todas como leídas" button.
- [x] **Task 1.4**: Integrate Attendance marking actions inside Rehearsal detail modal.
- [x] **Task 1.5**: Create floating `ToastNotification` component and CSS animations in `apps/web/src/index.css`.
- [x] **Task 1.6**: Connect dynamic notification triggers when scheduling a rehearsal or uploading a score.

### Phase 2: Backend Entities, DTOs & Module Setup (Pending Backend Implementation)
- [ ] **Task 2.1**: Create `apps/api/src/notifications/entities/notification.entity.ts`.
- [ ] **Task 2.2**: Create DTOs: `CreateNotificationDto`, `QueryNotificationDto`.
- [ ] **Task 2.3**: Create `apps/api/src/notifications/notifications.service.ts` with CRUD methods: `findAll`, `markAsRead`, `markAllAsRead`, `create`, `remove`.
- [ ] **Task 2.4**: Create `apps/api/src/notifications/notifications.controller.ts` with REST endpoints.
- [ ] **Task 2.5**: Register `Notification` entity in `apps/api/src/app.module.ts` TypeORM configuration.
- [ ] **Task 2.6**: Import `EventEmitterModule.forRoot()` in NestJS `AppModule`.

### Phase 3: Event Emission Triggers (Pending Backend Implementation)
- [ ] **Task 3.1**: Inject `EventEmitter2` in `RecordsService` and emit `rehearsal.scheduled` event upon creating a rehearsal log.
- [ ] **Task 3.2**: Inject `EventEmitter2` in `SheetsService` and emit `sheet.uploaded` event upon creating a new score.
- [ ] **Task 3.3**: Add attendance endpoint `POST /records/:id/attendance` in `RecordsController` and emit `attendance.marked` event.
- [ ] **Task 3.4**: Create `NotificationsListener` to handle all 3 events and persist notification records into database.

### Phase 4: Verification & E2E Testing
- [ ] **Task 4.1**: Unit test `NotificationsService` and `NotificationsListener`.
- [ ] **Task 4.2**: Test REST endpoints using Swagger (`http://localhost:3000/docs`).
- [ ] **Task 4.3**: Perform E2E test verifying that creating a rehearsal in API creates a notification record accessible via `GET /api/v1/notifications`.

---

## Summary of Completed Deliverables
1. **Frontend Notification Center UI**: Fully designed, styled, connected, and tested in `apps/web`.
2. **OpenSpec Specification File**: `openspec/specs/notifications.md` created.
3. **OpenSpec Change Proposal & Tasks**: `openspec/changes/003-notifications-system.md` created.
