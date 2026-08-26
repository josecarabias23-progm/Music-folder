# Tasks: Notifications System

## Phase 1: Frontend UI Place & Connection (Completed ✅)
- [x] Create `NotificationItem` interface and API helper functions in `apps/web/src/api.ts`.
- [x] Design Header Bell button with unread count badge in `apps/web/src/App.tsx`.
- [x] Design Notification Popover dropdown with category filter pills (`Todas`, `Ensayos`, `Partituras`, `Asistencia`) and "Marcar todo como leído" button matching Stitch UI design.
- [x] Add attendance options inside rehearsal detail modal.
- [x] Create Toast notification component and CSS animations in `apps/web/src/index.css`.
- [x] Connect automatic notification creation when scheduling a rehearsal or uploading a score.

## Phase 2: Backend Module & Data Layer (NestJS - Completed ✅)
- [x] Create `Notification` entity in `apps/api/src/notifications/entities/notification.entity.ts`.
- [x] Create Event classes: `RehearsalScheduledEvent`, `SheetUploadedEvent`, `AttendanceMarkedEvent`.
- [x] Implement `NotificationsService` with TypeORM Repository methods (`findAll`, `create`, `markAsRead`, `markAllAsRead`, `remove`).
- [x] Implement `NotificationsController` with REST endpoints (`GET`, `POST`, `PATCH`, `DELETE`).
- [x] Register `NotificationsModule` and `EventEmitterModule.forRoot()` in `AppModule`.

## Phase 3: Event Emission Triggers (Completed ✅)
- [x] Inject `EventEmitter2` in `RecordsService` and emit `rehearsal.scheduled` event upon creating a rehearsal.
- [x] Inject `EventEmitter2` in `SheetsService` and emit `sheet.uploaded` event upon uploading a score.
- [x] Add attendance endpoint `POST /records/:id/attendance` in `RecordsController` and emit `attendance.marked` event.
- [x] Implement `NotificationsListener` to catch events and insert notification records in database.

## Phase 4: E2E Verification & Build (Completed ✅)
- [x] Monorepo clean build verification (`npm run build -w apps/web && npm run build -w apps/api`).
