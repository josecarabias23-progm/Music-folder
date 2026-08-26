# Technical Design: Notifications System

## Architecture Overview
The system consists of two connected layers:
1. **Frontend Notification Center (`apps/web`)**:
   - Header Bell button with unread count badge.
   - Popover panel with category filter tabs (`Todas`, `Ensayos`, `Partituras`, `Asistencia`).
   - Rehearsal attendance confirmation buttons.
   - Real-time Toast alert system.

2. **Backend Notification Service (`apps/api`)**:
   - TypeORM `Notification` Entity.
   - `EventEmitter2` listeners for `rehearsal.scheduled`, `sheet.uploaded`, and `attendance.marked`.
   - REST Endpoints (`/api/v1/notifications`).

## Database Entity (`notifications`)
- `id`: UUID (Primary Key)
- `user_id`: UUID (Nullable)
- `type`: Enum (`rehearsal_scheduled`, `sheet_uploaded`, `attendance_marked`)
- `title`: String
- `message`: Text
- `read`: Boolean (Default false)
- `target_id`: UUID (Nullable)
- `metadata`: JSONB
- `created_at`: Timestamp
- `updated_at`: Timestamp
