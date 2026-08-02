# Music Folder Backend - Implementation Guide

Guía rápida para entender y ejecutar el backend inicialmente generado basado en las especificaciones de OpenSpec.

## 📊 Status Actual

✅ **Generado**: Esqueleto completo del backend con:
- Estructura de módulos NestJS
- DTOs validados con class-validator
- Entities de TypeORM (mock storage por ahora)
- Controllers con endpoints REST
- Services con lógica de negocio
- Documentación Swagger/OpenAPI

⏳ **TODO**: Integración de base de datos (PostgreSQL + TypeORM migrations)

---

## 🚀 Cómo Ejecutar Localmente

### 1. Prerequisitos
```bash
# Node.js 18+ LTS
node --version

# npm (incluido con Node)
npm --version
```

### 2. Instalar Dependencias

```bash
# Desde la raíz del proyecto
npm run bootstrap

# O manualmente en apps/api
cd apps/api
npm install
```

### 3. Configurar Variables de Entorno

Crea `.env.local` en `apps/api/`:

```env
# Database (TODO: PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/music-folder-dev

# JWT
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRES_IN=24h

# API
API_PORT=3000
API_ENV=development
CORS_ORIGIN=http://localhost:5173

# File Storage
S3_BUCKET=music-folder-local
S3_REGION=us-east-1
```

### 4. Compilar y Ejecutar

```bash
# Modo desarrollo (con auto-reload)
npm run start:dev -w apps/api

# Modo producción
npm run build -w apps/api
npm run start -w apps/api
```

### 5. Acceder a Documentación

Una vez ejecutándose:
- **Swagger Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

---

## 📁 Estructura de Archivos Generada

```
apps/api/src/
├── main.ts                          # Entry point (mejorado con Swagger)
├── app.controller.ts                # Health endpoint
├── app.service.ts                   # Health service
├── app.module.ts                    # Root module (TODO: TypeORM config)
├── common/
│   └── dto/
│       └── pagination.dto.ts        # Shared DTOs for pagination
├── sheets/                          # Module: Partituras
│   ├── sheets.controller.ts         # 6 endpoints (GET, POST, PATCH, DELETE, download)
│   ├── sheets.service.ts            # Business logic with mock data
│   ├── entities/
│   │   └── sheet.entity.ts          # TypeORM entity
│   └── dto/
│       └── create-sheet.dto.ts      # DTOs: CreateSheetDto, UpdateSheetDto
├── instruments/                     # Module: Instrumentos
│   ├── instruments.controller.ts    # 5 endpoints (GET, POST, PATCH, DELETE)
│   ├── instruments.service.ts       # Business logic with 3 mock instruments
│   ├── entities/
│   │   └── instrument.entity.ts     # TypeORM entity
│   └── dto/
│       └── create-instrument.dto.ts # DTOs: CreateInstrumentDto, UpdateInstrumentDto
└── records/                         # Stub (TODO: Implementar)
└── forums/                          # Stub (TODO: Implementar)
```

---

## 🔌 Endpoints Implementados

### Partituras (Sheets)

| Método | Endpoint | Descripción | Spec |
|--------|----------|-------------|------|
| GET | `/sheets` | Listar partituras con paginación | [#1.1](../../openspec/specs/api-endpoints.md#11-list-scores) |
| GET | `/sheets/:id` | Obtener partitura por ID | [#1.2](../../openspec/specs/api-endpoints.md#12-get-score-detail) |
| POST | `/sheets` | Crear nueva partitura | [#1.3](../../openspec/specs/api-endpoints.md#13-upload-score) |
| PATCH | `/sheets/:id` | Actualizar metadatos | [#1.4](../../openspec/specs/api-endpoints.md#14-update-score-metadata) |
| DELETE | `/sheets/:id` | Eliminar partitura | [#1.5](../../openspec/specs/api-endpoints.md#15-delete-score) |
| GET | `/sheets/:id/download` | Descargar archivo | [#1.6](../../openspec/specs/api-endpoints.md#16-download-score) |

**Query Parameters Soportados** (GET `/sheets`):
- `skip`: número de items a saltar (default: 0)
- `limit`: items por página (default: 20)
- `instrument_role`: filtrar por instrumento (ej: "Violin I")
- `difficulty`: filtrar por dificultad (beginner, intermediate, advanced, professional)
- `search`: buscar en título/compositor
- `sort`: ordenar por (newest, title, composer)

**Ejemplo de Request**:
```bash
curl -X GET "http://localhost:3000/sheets?search=Beethoven&difficulty=intermediate&limit=10"
```

### Instrumentos (Instruments)

| Método | Endpoint | Descripción | Spec |
|--------|----------|-------------|------|
| GET | `/instruments` | Listar instrumentos | [#2.1](../../openspec/specs/api-endpoints.md#21-list-instruments) |
| GET | `/instruments/:id` | Obtener instrumento por ID | [#2.2](../../openspec/specs/api-endpoints.md#22-get-instrument-detail) |
| POST | `/instruments` | Crear instrumento (Admin) | [#2.3](../../openspec/specs/api-endpoints.md#23-create-instrument-admin-only) |
| PATCH | `/instruments/:id` | Actualizar instrumento (Admin) | [#2.4](../../openspec/specs/api-endpoints.md#24-update-instrument-admin-only) |
| DELETE | `/instruments/:id` | Eliminar instrumento | Custom |

**Mock Data Incluido**:
- Violin (strings)
- Trumpet (brass)
- Cello (strings)

**Ejemplo de Request**:
```bash
# Listar instrumentos de viento
curl -X GET "http://localhost:3000/instruments?family=winds&limit=50"

# Obtener Violin
curl -X GET "http://localhost:3000/instruments/violin-id"
```

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check | 

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T15:30:00Z",
  "version": "1.0.0",
  "service": "Music Folder API"
}
```

---

## 🧪 Pruebas Rápidas

### Usando cURL

```bash
# Health check
curl http://localhost:3000/health

# Listar partituras
curl http://localhost:3000/sheets

# Obtener una partitura específica
curl http://localhost:3000/sheets/uuid-here

# Crear partitura (requiere JWT token)
curl -X POST http://localhost:3000/sheets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Symphony No. 9",
    "composer": "Beethoven",
    "instrument_role": "Violin I",
    "key_signature": "D Minor",
    "time_signature": "4/4",
    "difficulty_level": "advanced",
    "is_public": true,
    "tags": ["Romantic", "Orchestral"]
  }'

# Listar instrumentos
curl http://localhost:3000/instruments

# Crear instrumento (requiere JWT token + Admin role)
curl -X POST http://localhost:3000/instruments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "French Horn",
    "family": "brass",
    "transposition": "F",
    "is_transposing": true,
    "range": {"lowest_note": "B1", "highest_note": "F5"},
    "concert_range": {"lowest_note": "A1", "highest_note": "E5"},
    "clef": ["treble", "bass"],
    "dynamic_range": {"softest": "pp", "loudest": "fff"},
    "techniques": ["stopped", "open", "mute"],
    "maintenance_tips": "Oil valves daily...",
    "historical_info": "The French horn evolved from..."
  }'
```

### Usando Swagger UI

1. Abre http://localhost:3000/docs en navegador
2. Expande cada endpoint
3. Haz click en "Try it out"
4. Ingresa parámetros y ejecuta

---

## 🔑 Validaciones Implementadas (DTOs)

### CreateSheetDto
- `title`: string requerido
- `composer`: string requerido
- `instrument_role`: string requerido
- `key_signature`: string requerido
- `time_signature`: string requerido
- `difficulty_level`: enum (beginner, intermediate, advanced, professional)
- `arranger`: string opcional
- `duration_minutes`: number opcional
- `tags`: string[] opcional
- `is_public`: boolean requerido
- `organization_id`: string opcional (UUID)

### CreateInstrumentDto
- `name`: string requerido
- `family`: enum (strings, winds, brass, percussion, keyboard, electronic)
- `transposition`: string requerido
- `is_transposing`: boolean requerido
- `range`: object {lowest_note, highest_note}
- `concert_range`: object {lowest_note, highest_note}
- `clef`: string[] requerido
- `dynamic_range`: object {softest, loudest}
- `techniques`: string[] requerido
- `maintenance_tips`: string requerido
- `historical_info`: string requerido
- `notable_repertoire`: string[] opcional

---

## 📝 DTOs & Responses

### Sheet Response Example
```json
{
  "id": "uuid-123",
  "title": "Symphony No. 5",
  "composer": "Ludwig van Beethoven",
  "arranger": null,
  "upload_date": "2024-01-20T15:30:00Z",
  "instrument_role": "Violin I",
  "difficulty_level": "intermediate",
  "file_format": "pdf",
  "file_size": 2500000,
  "key_signature": "C Minor",
  "time_signature": "4/4",
  "duration_minutes": 35,
  "tags": ["Classical", "Romantic"],
  "is_public": true,
  "owner_id": "user-uuid",
  "organization_id": null,
  "created_at": "2024-01-20T15:30:00Z",
  "updated_at": "2024-01-20T15:30:00Z",
  "download_url": "http://localhost:3000/sheets/uuid-123/download"
}
```

### Instrument Response Example
```json
{
  "id": "uuid-456",
  "name": "Violin",
  "family": "strings",
  "transposition": "C",
  "is_transposing": false,
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
  "maintenance_tips": "Store in case with proper humidity...",
  "historical_info": "The violin emerged in Italy during...",
  "notable_repertoire": ["Violin Concerto in D", "The Four Seasons"],
  "created_at": "2024-01-20T15:30:00Z",
  "updated_at": "2024-01-20T15:30:00Z"
}
```

### Paginated Response Example
```json
{
  "data": [
    { ...sheet object... },
    { ...sheet object... }
  ],
  "pagination": {
    "total": 42,
    "skip": 0,
    "limit": 20
  }
}
```

---

## 🔄 Próximos Pasos (Roadmap)

### Phase 1 (Backend Setup) - ACTUAL
- [x] Endpoints de Sheets
- [x] Endpoints de Instruments  
- [ ] Integración de PostgreSQL + TypeORM
- [ ] Autenticación JWT + Passport
- [ ] Endpoints de Records (Rehearsal Logs)
- [ ] Endpoints de Forums
- [ ] Tests unitarios con Jest
- [ ] Documentación Swagger completa

### Phase 2 (Mejoras)
- [ ] Organizaciones (bandas/orquestas)
- [ ] Subida de archivos a S3
- [ ] Notificaciones
- [ ] Búsqueda avanzada

### Phase 3 (Escalabilidad)
- [ ] Redis caching
- [ ] GraphQL API
- [ ] Websockets para real-time

---

## 🐛 Debugging

### Logs en Development
```bash
# Ejecutar con más verbosidad
DEBUG=* npm run start:dev -w apps/api
```

### Verificar Endpoints
```bash
# Listar todas las rutas
curl http://localhost:3000/api/routes  # (custom endpoint, TODO)
```

---

## 🔗 Referencias

- [Especificación Completa](../../openspec/specs/api-endpoints.md)
- [Modelos de Datos](../../openspec/specs/data-models.md)
- [Arquitectura](../../openspec/specs/architecture.md)
- [Tech Stack](../../openspec/specs/tech-stack.md)

---

## 📞 Soporte

Para preguntas sobre la implementación:
1. Consulta la especificación en `openspec/specs/api-endpoints.md`
2. Revisa los comentarios en el código (referencia a specs)
3. Abre un issue si encuentras conflicto con la spec
