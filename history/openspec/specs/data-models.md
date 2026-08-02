# Data Models - Music Folder

## Overview
Definición de las entidades principales del sistema Music Folder, sus atributos y relaciones.

## Entity: User (Usuario)

### Descripción
Representa un usuario del sistema que puede ser músico, director, administrador u otro rol.

### Attributes
```
id: UUID
email: string (unique)
username: string (unique)
password_hash: string
first_name: string
last_name: string
bio: string (opcional)
profile_picture_url: string (opcional)
role: enum [musician, conductor, admin, guest]
instrument_primary: string (opcional, ej: "Violin", "Trumpet")
instrument_secondary: array<string> (opcional)
created_at: timestamp
updated_at: timestamp
is_active: boolean
```

### Relationships
- **1-N**: User → Scores (usuario puede poseer muchas partituras)
- **1-N**: User → RehearsalLogs (usuario puede crear muchos registros de ensayos)
- **1-N**: User → ForumPosts (usuario puede crear posts en foros)
- **N-N**: User ↔ Organizations (un usuario puede pertenecer a múltiples organizaciones: bandas, orquestas)

---

## Entity: Score (Partitura)

### Descripción
Archivo de partitura con metadatos, accesible según rol e instrumento.

### Attributes
```
id: UUID
title: string
composer: string
arranger: string (opcional)
upload_date: timestamp
file_url: string (ruta al PDF/imagen)
file_format: enum [pdf, jpg, png, musicxml]
file_size: integer (bytes)
key_signature: string (ej: "C Major", "F# Minor")
time_signature: string (ej: "4/4", "3/8")
duration_minutes: integer (opcional, si se conoce)
instrument_role: string (ej: "Violin I", "Bass", "Conductor Full Score")
difficulty_level: enum [beginner, intermediate, advanced, professional]
tags: array<string> (ej: ["Classical", "Baroque", "Chamber"])
owner_id: UUID (reference to User)
organization_id: UUID (reference a Organization, opcional)
is_public: boolean (si puede descargarse sin permisos especiales)
created_at: timestamp
updated_at: timestamp
```

### Relationships
- **N-1**: Score → User (muchas partituras de un usuario)
- **N-1**: Score → Organization (muchas partituras de una organización)
- **N-N**: Score ↔ RehearsalLog (una partitura puede usarse en múltiples ensayos)

---

## Entity: Instrument (Instrumento - Enciclopedia)

### Descripción
Información educativa sobre instrumentos musicales, sus características técnicas y musicales.

### Attributes
```
id: UUID
name: string (ej: "Violin", "Trumpet", "Contrabass")
family: enum [strings, winds, brass, percussion, keyboard, electronic]
transposition: string (ej: "B♭", "E♭", "C")
is_transposing: boolean
range: object {
  lowest_note: string (ej: "G3"),
  highest_note: string (ej: "E7")
}
concert_range: object {
  lowest_note: string,
  highest_note: string
}
clef: array<enum> [treble, bass, alto, tenor] (claves usadas)
dynamic_range: object {
  softest: string (ej: "ppp"),
  loudest: string (ej: "fff")
}
techniques: array<string> (ej: ["vibrato", "tremolo", "pizzicato", "harmonics"])
maintenance_tips: string (consejos de mantenimiento)
historical_info: string (información histórica)
notable_repertoire: array<string> (obras maestras para el instrumento)
similar_instruments: array<UUID> (IDs de instrumentos relacionados)
created_at: timestamp
updated_at: timestamp
```

### Relationships
- **N-N**: Instrument ↔ Score (una partitura puede tener múltiples instrumentos necesarios)
- **N-N**: Instrument ↔ User (favoritos de usuario)

---

## Entity: RehearsalLog (Registro de Ensayo)

### Descripción
Registro de una sesión de ensayo/práctica, vinculado a partituras y repertorio.

### Attributes
```
id: UUID
title: string (ej: "Preparación concierto Abril")
date: timestamp
duration_minutes: integer
location: string (opcional, ej: "Sala A del conservatorio")
conductor_id: UUID (reference to User)
organization_id: UUID (reference to Organization, opcional)
rehearsal_type: enum [individual_practice, group_rehearsal, orchestra_rehearsal, sectional]
scores_worked: array<UUID> (references to Scores trabajadas)
notes: string (markdown - notas generales del ensayo)
focus_areas: array<string> (ej: ["Intonation", "Rhythm precision", "Dynamics"])
audio_reference_url: string (opcional, URL a archivo de audio de referencia)
audio_reference_file: binary (opcional, archivo de audio embebido)
participants: array<UUID> (references a Users que participaron)
attendance: array<object> { user_id, present: boolean }
next_focus: string (qué trabajar en próximo ensayo)
created_by: UUID (reference to User - quien creó el registro)
created_at: timestamp
updated_at: timestamp
```

### Relationships
- **N-1**: RehearsalLog → User (conductor/creador)
- **N-N**: RehearsalLog ↔ Score (múltiples partituras en un ensayo)
- **N-N**: RehearsalLog ↔ User (múltiples participantes)
- **N-1**: RehearsalLog → Organization (opcional)

---

## Entity: ForumThread (Hilo de Foro)

### Descripción
Tema de discusión en la comunidad de Music Folder.

### Attributes
```
id: UUID
title: string
category: enum [technique, maintenance, composition, concert_organization, general, instrument_specific]
description: string (markdown)
created_by: UUID (reference to User)
created_at: timestamp
updated_at: timestamp
is_pinned: boolean (publicaciones destacadas)
is_locked: boolean (si está cerrado a nuevas respuestas)
view_count: integer
tags: array<string>
```

### Relationships
- **N-1**: ForumThread → User (creador)
- **1-N**: ForumThread → Comment (un hilo tiene muchos comentarios)

---

## Entity: ForumComment (Comentario de Foro)

### Descripción
Respuesta o comentario dentro de un hilo de discusión.

### Attributes
```
id: UUID
thread_id: UUID (reference to ForumThread)
content: string (markdown)
author_id: UUID (reference to User)
created_at: timestamp
updated_at: timestamp
is_edited: boolean
edit_reason: string (opcional)
likes_count: integer
parent_comment_id: UUID (opcional, si es respuesta a otro comentario)
attachments: array<object> { file_url, file_type }
```

### Relationships
- **N-1**: ForumComment → ForumThread
- **N-1**: ForumComment → User (autor)
- **N-N**: ForumComment ↔ User (likes)
- **N-1**: ForumComment → ForumComment (respuestas anidadas, opcional para MVP)

---

## Entity: Organization (Organización)

### Descripción
Representa una banda, orquesta, o grupo musical.

### Attributes
```
id: UUID
name: string
description: string
organization_type: enum [orchestra, band, ensemble, school_band, community_group]
founder_id: UUID (reference to User)
members: array<UUID> (references a Users)
roles_available: array<string> (ej: ["Violin I", "Violin II", "Viola", "Cello", "Bass"])
profile_picture_url: string (opcional)
created_at: timestamp
updated_at: timestamp
```

### Relationships
- **1-N**: Organization → User (members, N-N relationship)
- **1-N**: Organization → Score
- **1-N**: Organization → RehearsalLog

---

## Storage Architecture

### Base URLs for Files
```
/uploads/scores/{user_id}/{score_id}/
/uploads/rehearsal_audio/{organization_id}/{rehearsal_log_id}/
/uploads/forum_attachments/{thread_id}/{comment_id}/
```

### Database Schema Organization
```
Database: music-folder-db

Tables:
  users
  organizations
  org_members (join table)
  scores
  score_instruments (join table)
  instruments
  rehearsal_logs
  rehearsal_participants (join table)
  rehearsal_scores (join table)
  forum_threads
  forum_comments
  forum_likes (join table)
  user_instrument_favorites (join table)
```

---

## Data Validation Rules

### User
- Email must be unique and valid format
- Username: 3-30 characters, alphanumeric + underscore
- Password: minimum 8 characters (enforce at application level)
- Role assignment: only admins can assign roles

### Score
- File must be PDF or image format
- File size < 50MB
- Title is required
- Owner must be authenticated user

### RehearsalLog
- Date cannot be in future
- Duration > 0 minutes
- At least one score or focus area required

### ForumThread
- Title: 5-200 characters
- Category must be predefined enum
- Only users can create threads (role validation)

### ForumComment
- Content: 1-10000 characters
- Cannot reply to comments if thread is locked
