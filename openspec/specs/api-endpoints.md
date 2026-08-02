# API Endpoints & Use Cases - Music Folder

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.musicfolder.app/v1
```

## Authentication
- **Standard**: Bearer token via JWT (Authorization header)
- **Endpoint**: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`
- All protected endpoints require valid JWT

---

## Module 1: Scores (Partituras)

### 1.1 List Scores
**Endpoint**: `GET /sheets`  
**Auth**: Required  
**Query Parameters**:
- `skip`: integer (default: 0) - pagination offset
- `limit`: integer (default: 20) - items per page
- `instrument_role`: string - filter by instrument (e.g., "Violin I")
- `difficulty`: string - filter by difficulty [beginner, intermediate, advanced, professional]
- `search`: string - search in title/composer
- `organization_id`: UUID - filter by organization (optional)
- `sort`: enum [newest, title, composer] (default: newest)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Symphony No. 5",
      "composer": "Beethoven",
      "arranger": null,
      "upload_date": "2024-01-15T10:30:00Z",
      "instrument_role": "Violin I",
      "difficulty_level": "intermediate",
      "file_format": "pdf",
      "key_signature": "C Minor",
      "time_signature": "4/4",
      "duration_minutes": 35,
      "tags": ["Classical", "Romantic"],
      "owner": {
        "id": "uuid",
        "username": "jsmith",
        "first_name": "John"
      },
      "is_public": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "skip": 0,
    "limit": 20
  }
}
```

**Status Codes**: 200 OK, 400 Bad Request, 401 Unauthorized

---

### 1.2 Get Score Detail
**Endpoint**: `GET /sheets/{score_id}`  
**Auth**: Required (can view if owner, organization member, or public)  
**Response**: Full score object with download URL

---

### 1.3 Upload Score
**Endpoint**: `POST /sheets`  
**Auth**: Required (authenticated user)  
**Content-Type**: multipart/form-data  
**Body**:
```json
{
  "title": "Symphony No. 5",
  "composer": "Ludwig van Beethoven",
  "arranger": "Custom Arrangement",
  "file": <binary PDF or image>,
  "instrument_role": "Violin I",
  "key_signature": "C Minor",
  "time_signature": "4/4",
  "difficulty_level": "intermediate",
  "tags": ["Classical", "Romantic"],
  "is_public": true,
  "organization_id": "uuid (optional)"
}
```

**Response**: 201 Created - newly created score object with download URL

**Validations**:
- File required, format PDF/JPG/PNG/MusicXML
- File size < 50MB
- Title 3-200 characters
- Only owner or org admin can upload to organization

---

### 1.4 Update Score Metadata
**Endpoint**: `PATCH /sheets/{score_id}`  
**Auth**: Required (owner or organization admin only)  
**Body**: Subset of score fields (title, composer, tags, difficulty_level, is_public, etc.)

**Response**: 200 OK - updated score object

---

### 1.5 Delete Score
**Endpoint**: `DELETE /sheets/{score_id}`  
**Auth**: Required (owner or organization admin only)  
**Response**: 204 No Content

---

### 1.6 Download Score
**Endpoint**: `GET /sheets/{score_id}/download`  
**Auth**: Required (can download if owner, organization member, or public)  
**Response**: Binary file (PDF/image)

---

## Module 2: Instruments (Enciclopedia)

### 2.1 List Instruments
**Endpoint**: `GET /instruments`  
**Auth**: Not required  
**Query Parameters**:
- `family`: enum [strings, winds, brass, percussion, keyboard, electronic]
- `transposing`: boolean - filter transposing instruments
- `search`: string - search in name

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Violin",
      "family": "strings",
      "is_transposing": false,
      "transposition": "C",
      "range": {
        "lowest_note": "G3",
        "highest_note": "E7"
      },
      "concert_range": {
        "lowest_note": "G3",
        "highest_note": "E7"
      },
      "clef": ["treble"],
      "dynamic_range": {
        "softest": "ppp",
        "loudest": "fff"
      },
      "techniques": ["vibrato", "tremolo", "pizzicato", "harmonics"],
      "maintenance_tips": "...",
      "historical_info": "...",
      "notable_repertoire": ["Violin Concerto in D", "The Four Seasons"]
    }
  ],
  "pagination": { "total": 89 }
}
```

**Status Codes**: 200 OK, 400 Bad Request

---

### 2.2 Get Instrument Detail
**Endpoint**: `GET /instruments/{instrument_id}`  
**Auth**: Not required  
**Response**: Complete instrument object with all details

---

### 2.3 Create Instrument (Admin Only)
**Endpoint**: `POST /instruments`  
**Auth**: Required (admin role only)  
**Body**: Full instrument object

**Response**: 201 Created

---

### 2.4 Update Instrument (Admin Only)
**Endpoint**: `PATCH /instruments/{instrument_id}`  
**Auth**: Required (admin role only)  
**Response**: 200 OK

---

## Module 3: Rehearsal Logs (Registros de Ensayos)

### 3.1 List Rehearsal Logs
**Endpoint**: `GET /records`  
**Auth**: Required  
**Query Parameters**:
- `skip`: integer (default: 0)
- `limit`: integer (default: 20)
- `organization_id`: UUID - filter by organization
- `date_from`: ISO 8601 date
- `date_to`: ISO 8601 date
- `rehearsal_type`: enum [individual_practice, group_rehearsal, orchestra_rehearsal, sectional]
- `sort`: enum [newest, oldest, date]

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Preparación concierto Abril",
      "date": "2024-01-20T14:00:00Z",
      "duration_minutes": 90,
      "location": "Sala A del conservatorio",
      "conductor": {
        "id": "uuid",
        "username": "conductor1",
        "first_name": "Carlos"
      },
      "rehearsal_type": "orchestra_rehearsal",
      "scores_worked": ["uuid1", "uuid2"],
      "focus_areas": ["Intonation", "Rhythm precision"],
      "participants_count": 25,
      "organization": {
        "id": "uuid",
        "name": "City Orchestra"
      },
      "created_at": "2024-01-20T15:30:00Z"
    }
  ],
  "pagination": { "total": 156 }
}
```

**Status Codes**: 200 OK, 401 Unauthorized

---

### 3.2 Get Rehearsal Log Detail
**Endpoint**: `GET /records/{record_id}`  
**Auth**: Required (conductor, participants, or org admin only)  
**Response**: Complete rehearsal log with audio reference URL

---

### 3.3 Create Rehearsal Log
**Endpoint**: `POST /records`  
**Auth**: Required  
**Body**:
```json
{
  "title": "Preparación concierto Abril",
  "date": "2024-01-20T14:00:00Z",
  "duration_minutes": 90,
  "location": "Sala A del conservatorio",
  "organization_id": "uuid (optional)",
  "rehearsal_type": "orchestra_rehearsal",
  "scores_worked": ["uuid1", "uuid2"],
  "notes": "# Session Notes\n\n## Progress\n- Good tempo control\n- Some intonation issues in violas",
  "focus_areas": ["Intonation", "Rhythm precision"],
  "audio_reference_url": "https://storage.example.com/ref.mp3 (optional)",
  "participants": ["uuid1", "uuid2", "uuid3"]
}
```

**Response**: 201 Created - new rehearsal log object

---

### 3.4 Update Rehearsal Log
**Endpoint**: `PATCH /records/{record_id}`  
**Auth**: Required (conductor/creator only)  
**Body**: Updatable fields (notes, focus_areas, etc.)

**Response**: 200 OK

---

### 3.5 Delete Rehearsal Log
**Endpoint**: `DELETE /records/{record_id}`  
**Auth**: Required (conductor/creator or org admin only)  
**Response**: 204 No Content

---

### 3.6 Get Rehearsal Attendance
**Endpoint**: `GET /records/{record_id}/attendance`  
**Auth**: Required (participants or org admin)  
**Response**: List of participants with attendance status

---

### 3.7 Update Attendance
**Endpoint**: `PATCH /records/{record_id}/attendance`  
**Auth**: Required (conductor only)  
**Body**:
```json
{
  "attendance": [
    { "user_id": "uuid", "present": true },
    { "user_id": "uuid", "present": false }
  ]
}
```

**Response**: 200 OK

---

## Module 4: Community Forum

### 4.1 List Forum Threads
**Endpoint**: `GET /forums/threads`  
**Auth**: Not required (public read)  
**Query Parameters**:
- `skip`: integer (default: 0)
- `limit`: integer (default: 20)
- `category`: enum [technique, maintenance, composition, concert_organization, general, instrument_specific]
- `search`: string - search in title/description
- `sort`: enum [newest, most_viewed, most_commented]

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Best techniques for violin vibrato",
      "category": "technique",
      "description": "Let's discuss the various approaches...",
      "created_by": {
        "id": "uuid",
        "username": "violinist_pro",
        "first_name": "Maria"
      },
      "created_at": "2024-01-18T10:00:00Z",
      "is_pinned": true,
      "is_locked": false,
      "view_count": 542,
      "comments_count": 23,
      "tags": ["vibrato", "technique", "violin"]
    }
  ],
  "pagination": { "total": 234 }
}
```

**Status Codes**: 200 OK

---

### 4.2 Get Forum Thread Detail
**Endpoint**: `GET /forums/threads/{thread_id}`  
**Auth**: Not required  
**Response**: Thread + paginated comments (default 20 per page)

---

### 4.3 Create Forum Thread
**Endpoint**: `POST /forums/threads`  
**Auth**: Required (authenticated user)  
**Body**:
```json
{
  "title": "Best techniques for violin vibrato",
  "category": "technique",
  "description": "Let's discuss the various approaches to developing vibrato...",
  "tags": ["vibrato", "technique", "violin"]
}
```

**Response**: 201 Created - new thread object

**Validations**:
- Title: 5-200 characters
- Description: 10-5000 characters
- Category must be predefined enum

---

### 4.4 Lock/Pin Forum Thread (Moderator/Admin Only)
**Endpoint**: `PATCH /forums/threads/{thread_id}`  
**Auth**: Required (admin/moderator only)  
**Body**:
```json
{
  "is_locked": true,
  "is_pinned": true
}
```

**Response**: 200 OK

---

### 4.5 Create Forum Comment
**Endpoint**: `POST /forums/threads/{thread_id}/comments`  
**Auth**: Required  
**Body**:
```json
{
  "content": "I recommend starting with open string vibrato...",
  "parent_comment_id": "uuid (optional for nested replies)"
}
```

**Response**: 201 Created - new comment object

**Validations**:
- Content: 1-10000 characters
- Cannot reply if thread is locked

---

### 4.6 List Comments in Thread
**Endpoint**: `GET /forums/threads/{thread_id}/comments`  
**Auth**: Not required  
**Query Parameters**:
- `skip`: integer (default: 0)
- `limit`: integer (default: 20)
- `sort`: enum [newest, oldest, most_liked]

**Response**: Paginated list of comments

---

### 4.7 Update Forum Comment
**Endpoint**: `PATCH /forums/threads/{thread_id}/comments/{comment_id}`  
**Auth**: Required (author only)  
**Body**:
```json
{
  "content": "Updated content...",
  "edit_reason": "Fixed typo"
}
```

**Response**: 200 OK

---

### 4.8 Delete Forum Comment
**Endpoint**: `DELETE /forums/threads/{thread_id}/comments/{comment_id}`  
**Auth**: Required (author or admin only)  
**Response**: 204 No Content

---

### 4.9 Like/Unlike Comment
**Endpoint**: `POST /forums/threads/{thread_id}/comments/{comment_id}/like`  
**Endpoint**: `DELETE /forums/threads/{thread_id}/comments/{comment_id}/like`  
**Auth**: Required  
**Response**: 200 OK - with updated likes_count

---

## Module 5: Organizations (Bandas/Orquestas)

### 5.1 List Organizations
**Endpoint**: `GET /organizations`  
**Auth**: Not required  
**Response**: Public organizations list with member counts

---

### 5.2 Get Organization Detail
**Endpoint**: `GET /organizations/{org_id}`  
**Auth**: Not required (public info) or Required (members see more)  
**Response**: Organization details, members list (if authorized)

---

### 5.3 Create Organization
**Endpoint**: `POST /organizations`  
**Auth**: Required  
**Body**:
```json
{
  "name": "City Symphony Orchestra",
  "description": "Professional orchestra based in downtown",
  "organization_type": "orchestra",
  "roles_available": ["Violin I", "Violin II", "Viola", "Cello", "Bass"]
}
```

**Response**: 201 Created

---

### 5.4 Add Member to Organization
**Endpoint**: `POST /organizations/{org_id}/members`  
**Auth**: Required (org admin only)  
**Body**:
```json
{
  "user_id": "uuid",
  "role": "Violin I"
}
```

**Response**: 200 OK

---

### 5.5 Remove Member from Organization
**Endpoint**: `DELETE /organizations/{org_id}/members/{user_id}`  
**Auth**: Required (org admin only)  
**Response**: 204 No Content

---

## Module 6: Health & System

### 6.1 Health Check
**Endpoint**: `GET /health`  
**Auth**: Not required  
**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T15:30:00Z",
  "version": "1.0.0"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

**Common Status Codes**:
- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request - validation error
- 401 Unauthorized - authentication required
- 403 Forbidden - authorization error
- 404 Not Found - resource not found
- 409 Conflict - unique constraint violation
- 422 Unprocessable Entity - semantic error
- 500 Internal Server Error
- 503 Service Unavailable

---

## Rate Limiting
- **Limit**: 100 requests per minute per authenticated user
- **Public endpoints**: 30 requests per minute per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Pagination Standard
All list endpoints support pagination with:
- `skip` (offset)
- `limit` (max items, capped at 100)
- Response includes `pagination` object with `total`, `skip`, `limit`
