# Notifications Specification

## Overview
The Notifications module provides a real-time & persistent notification system for Music Folder. It keeps musicians, conductors, and administrators informed about key events within their musical ensemble.

---

## Data Models

### Entity: `Notification`
Table name: `notifications`

| Field | Type | Nullable | Constraints / Description |
|-------|------|----------|---------------------------|
| `id` | `uuid` | No | Primary Key, Auto-generated UUID v4 |
| `userId` | `uuid` | Yes | Target user ID (null for broadcast to ensemble) |
| `type` | `varchar(50)` | No | Event type: `'rehearsal_scheduled' \| 'sheet_uploaded' \| 'attendance_marked'` |
| `title` | `varchar(150)` | No | Brief notification headline |
| `message` | `text` | No | Detailed notification message |
| `read` | `boolean` | No | Default: `false` |
| `targetId` | `uuid` | Yes | Foreign entity ID (rehearsal ID or score ID) |
| `metadata` | `jsonb` | Yes | Additional contextual data (author, venue, date, status, ensemble) |
| `createdAt` | `timestamp` | No | Default: `CURRENT_TIMESTAMP` |
| `updatedAt` | `timestamp` | No | Default: `CURRENT_TIMESTAMP` |

---

## Event Trigger Architecture

The backend uses NestJS `@nestjs/event-emitter` (`EventEmitter2`) to decouple business domain actions from notification generation.

```
┌────────────────────────────────┐
│  Domain Actions                │
│                                │
│  1. Rehearsal Scheduled ───────┼───► Emit: rehearsal.scheduled
│  2. Sheet Uploaded ────────────┼───► Emit: sheet.uploaded
│  3. Attendance Marked ─────────┼───► Emit: attendance.marked
└────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│  NotificationsEventListener    │
│  (apps/api/src/notifications)  │
└────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│  NotificationsService          │
│  - Persists Notification       │
│  - Broadcasts / Dispatches     │
└────────────────────────────────┘
```

### Event Payload Specs

#### 1. `rehearsal.scheduled`
- **Trigger**: When `POST /api/v1/records` creates a new rehearsal.
- **Payload**: `{ rehearsalId: string, title: string, date: string, time: string, venue: string, author: string, ensemble?: string }`
- **Notification generated**:
  - `type`: `'rehearsal_scheduled'`
  - `title`: `'Nuevo ensayo agendado'`
  - `message`: `'Se programó "${title}" para el ${date} en ${venue}.'`

#### 2. `sheet.uploaded`
- **Trigger**: When `POST /api/v1/sheets` uploads a new score.
- **Payload**: `{ sheetId: string, title: string, composer: string, ensemble: string, category: string, uploader: string }`
- **Notification generated**:
  - `type`: `'sheet_uploaded'`
  - `title`: `'Nueva partitura publicada'`
  - `message`: `'Se ha publicado "${title}" de ${composer} para ${ensemble}.'`

#### 3. `attendance.marked`
- **Trigger**: When `POST /api/v1/records/:id/attendance` records member attendance.
- **Payload**: `{ rehearsalId: string, rehearsalTitle: string, userId: string, userName: string, status: 'presente' | 'ausente' | 'justificado' }`
- **Notification generated**:
  - `type`: `'attendance_marked'`
  - `title`: `'Asistencia registrada'`
  - `message`: `'${userName} registró asistencia como ${status} en "${rehearsalTitle}".'`

---

## API Endpoints Specification

### 1. `GET /api/v1/notifications`
- **Description**: Retrieves all notifications for the authenticated user (or global ensemble notifications).
- **Query Params**:
  - `unreadOnly` (`boolean`, optional): Filter only unread notifications.
  - `type` (`string`, optional): Filter by notification type.
- **Response**: `200 OK`
```json
[
  {
    "id": "c7a884f3-1811-460d-9b57-df49d79904bb",
    "type": "rehearsal_scheduled",
    "title": "Nuevo ensayo agendado",
    "message": "Se programó el Ensayo General para la Sinfonía N.º 5 de Beethoven.",
    "read": false,
    "targetId": "e30129a8-38bb-4b71-b0a7-bc5e683416a2",
    "metadata": {
      "date": "Jueves, 31 de julio · 19:00 hs",
      "venue": "Auditorio Manuel de Falla",
      "author": "Dirección Musical"
    },
    "createdAt": "2026-08-26T19:30:00Z"
  }
]
```

### 2. `PATCH /api/v1/notifications/:id/read`
- **Description**: Marks a specific notification as read.
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read",
  "id": "c7a884f3-1811-460d-9b57-df49d79904bb"
}
```

### 3. `PATCH /api/v1/notifications/read-all`
- **Description**: Marks all notifications for the user as read.
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "count": 5
}
```

### 4. `DELETE /api/v1/notifications/:id`
- **Description**: Deletes a notification record.
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Notification deleted"
}
```
