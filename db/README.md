# SQLite migration base

Este directorio contiene la base inicial para migrar los datos actuales del proyecto a SQLite.

## Datos observados y migrables desde el código actual

### 1. Instruments
Origen: `apps/api/src/instruments/instruments.service.ts`
- catálogo estático de instrumentos
- campos: `id`, `name`, `family`, `clef`, `transposition`, `description`

### 2. Sheets / Scores
Origen: `apps/api/src/sheets/sheets.service.ts`
- catálogo estático de partituras
- campos: `id`, `title`, `composer`, `ensemble`, `category`, `difficulty`, `isFavorite`, `type`, `owner`

### 3. Records / RehearsalLogs
Origen: `apps/api/src/records/records.service.ts`
- datos de ensayos en memoria
- campos: `id`, `title`, `type`, `date`, `time`, `venue`, `attendeesCount`, `notes`

### 4. Forums
Origen: `apps/api/src/forums/forums.service.ts`
- `forum_threads` y `forum_comments`
- datos in-memory de las conversaciones actuales

## Tablas base creadas

- `users` (reservada para futura autenticación y perfiles)
- `organizations` (reservada para futuro modelo organizacional)
- `scores`
- `instruments`
- `rehearsal_logs`
- `forum_threads`
- `forum_comments`

## Cómo regenerar la base

```bash
sqlite3 db/music-folder.sqlite < db/schema.sql
sqlite3 db/music-folder.sqlite < db/seed.sql
```
