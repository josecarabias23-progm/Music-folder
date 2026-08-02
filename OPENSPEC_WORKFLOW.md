# OpenSpec Workflow - Music Folder

Explicación completa de cómo usar OpenSpec para el desarrollo spec-driven de Music Folder.

## ¿Qué es OpenSpec?

**OpenSpec es un gestor de especificaciones**, NO un generador de código automático.

Funciona así:
```
Especificaciones (Specs)
    ↓
Cambios (Changes) 
    ↓
Tareas (Tasks)
    ↓
TÚ implementas el código manualmente
    ↓
Código completado y archivado
```

---

## Comandos OpenSpec Disponibles

### 1. Ver Especificaciones Existentes

```bash
# Ver la especificación principal del proyecto
openspec show

# Resultado esperado:
# PROJECT: Music Folder
# Main spec: music-folder.md
# Location: /path/to/music-folder/openspec/specs/music-folder.md
```

### 2. Ver un Cambio Específico

```bash
# Ver detalles del cambio #2 (especificación completa)
openspec show 002-complete-initial-spec

# Resultado: Muestra el contenido del archivo
# Change: Complete Initial Specification
# Summary: Design and document the complete specification...
# Artifacts: proposal.md, design.md, tasks.md
```

### 3. Ver Estado de un Cambio

```bash
# Ver qué tareas están pendientes en un cambio
openspec status --change "002-complete-initial-spec"

# Resultado esperado:
# Change: 002-complete-initial-spec
# Status: In Progress
# Completed Artifacts: [proposal.md, design.md]
# Remaining Tasks: [Phase 1 Backend Tasks, Phase 2 UI Tasks, ...]
```

### 4. Ver Instrucciones para Implementar

```bash
# Ver instrucciones para una tarea específica
openspec instructions tasks --change "002-complete-initial-spec"

# Resultado: Instrucciones paso-a-paso para implementar cada tarea
```

### 5. Archiver un Cambio (Cuando esté listo)

```bash
# Después de completar todas las tareas de un cambio
openspec archive "002-complete-initial-spec"

# Resultado: Movido a openspec/changes/archive/
# Nuevo cambio vacío creado automáticamente
```

### 6. Crear un Nuevo Cambio

```bash
# Crear un nuevo cambio para una fase/feature
openspec new change "003-add-forum-module"

# Resultado:
# Created: openspec/changes/003-add-forum-module.md
# Run: openspec instructions tasks --change "003-add-forum-module"
```

---

## Flujo Spec-Driven Development para Music Folder

### Phase 1: Implementación Backend (Actual)

```
┌─────────────────────────────────────────────────────┐
│ PASO 1: Leer las especificaciones                  │
│                                                    │
│ - openspec/specs/music-folder.md (visión)         │
│ - openspec/specs/data-models.md (entidades)       │
│ - openspec/specs/api-endpoints.md (API)           │
│ - openspec/specs/architecture.md (estructura)     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ PASO 2: Ver tareas de implementación               │
│                                                    │
│ Command:                                           │
│   openspec show 002-complete-initial-spec         │
│                                                    │
│ Resultado: Ves las 54 tareas organizadas por      │
│ fase, todos los endpoints que falta implementar   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ PASO 3: Comienza con "Phase 1 Backend Setup"      │
│                                                    │
│ Tareas en orden:                                  │
│ 1. Initialize NestJS project ✅ (ya hecho)        │
│ 2. Configure TypeORM and PostgreSQL               │
│ 3. Set up authentication (JWT + Passport)        │
│ 4. Create User entity and CRUD                    │
│ 5. Create Sheets module ✅ (endpoints completos)  │
│ 6. Create Instruments module ✅ (endpoints)       │
│ 7. Create Records module (falta)                  │
│ 8. Create Forums module (falta)                   │
│ 9. Add tests for each service                     │
│ 10. Deploy to staging                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ PASO 4: Implementas el código                      │
│                                                    │
│ Para CADA tarea:                                  │
│ a. Lee la especificación relacionada              │
│ b. Implementa el código                           │
│ c. Prueba con curl o Postman                      │
│ d. Verifica contra la especificación              │
│ e. Marca tarea como completada                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ PASO 5: Archiva el cambio (cuando Phase 1 esté OK)│
│                                                    │
│ Command:                                           │
│   openspec archive "002-complete-initial-spec"   │
│                                                    │
│ Resultado: Cambio movido a archive/, listo para  │
│ crear nuevo cambio 003-* para Phase 2             │
└─────────────────────────────────────────────────────┘
```

---

## Ejemplo: Implementar una Tarea desde Cero

### Tarea: "Create Records module with rehearsal endpoints"

#### 1. Lee la especificación

```bash
# En: openspec/specs/api-endpoints.md
# Sección: Module 3: Rehearsal Logs (Registros de Ensayos)
# Endpoints a implementar: 7 endpoints
```

#### 2. Crea la carpeta del módulo

```bash
mkdir -p apps/api/src/records/{dto,entities,storage}
```

#### 3. Define el Entity

```typescript
// apps/api/src/records/entities/rehearsal-log.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('rehearsal_logs')
export class RehearsalLog {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  title: string;

  @Column('timestamp')
  date: Date;

  // ... más campos según data-models.md
}
```

#### 4. Define los DTOs

```typescript
// apps/api/src/records/dto/create-rehearsal-log.dto.ts
export class CreateRehearsalLogDto {
  title: string;
  date: Date;
  duration_minutes: number;
  // ... más campos
}
```

#### 5. Implementa el Service

```typescript
// apps/api/src/records/records.service.ts
@Injectable()
export class RecordsService {
  async create(createRehearsalLogDto: CreateRehearsalLogDto): Promise<RehearsalLog> {
    // Lógica aquí
  }

  async findAll(): Promise<RehearsalLog[]> {
    // Lógica aquí
  }
  // ... etc
}
```

#### 6. Implementa el Controller

```typescript
// apps/api/src/records/records.controller.ts
@Controller('records')
export class RecordsController {
  @Get()
  findAll() {
    return this.recordsService.findAll();
  }

  @Post()
  create(@Body() createRehearsalLogDto: CreateRehearsalLogDto) {
    return this.recordsService.create(createRehearsalLogDto);
  }
  // ... resto de endpoints
}
```

#### 7. Registra el módulo

```typescript
// apps/api/src/app.module.ts
import { RecordsModule } from './records/records.module';

@Module({
  imports: [
    // ... otros módulos
    RecordsModule,
  ],
})
export class AppModule {}
```

#### 8. Prueba

```bash
# Inicia el servidor
npm run start:dev -w apps/api

# Prueba endpoints
curl http://localhost:3000/docs  # Swagger
curl http://localhost:3000/records
```

#### 9. Verifica contra la especificación

Compara tu implementación con:
- `openspec/specs/api-endpoints.md` - ¿Todos los endpoints están?
- `openspec/specs/data-models.md` - ¿Todos los campos están?
- `openspec/specs/architecture.md` - ¿La estructura es correcta?

#### 10. Marca como completada

Una vez todo funciona y coincide con la spec, la tarea está lista.

---

## Estructura de Cambios en OpenSpec

### Cambio #1: 001-initial-api-spec.md
**Status**: Completado  
**Contenido**: Requerimientos iniciales básicos  
**Output**: Definición del problema

### Cambio #2: 002-complete-initial-spec.md
**Status**: En Progreso  
**Contenido**: Especificación completa + 54 tareas de implementación  
**Output**: Código backend generado (Sheets, Instruments), estructura NestJS

### Cambio #3: 003-frontend-ui.md (Próximo)
**Status**: Planificado  
**Contenido**: Implementación UI React  
**Tasks**: 25+ tareas de componentes, páginas, hooks

### Cambio #4: 004-organizations-teams.md (Después)
**Status**: Planificado  
**Contenido**: Módulo de organizaciones  
**Tasks**: 12+ tareas para gestión de equipos

---

## Relación: Especificaciones ↔ Cambios ↔ Código

```
openspec/specs/
├── music-folder.md                 ← Visión general del proyecto
├── data-models.md                  ← Define qué datos existen
├── api-endpoints.md                ← Define qué endpoints hacer
├── architecture.md                 ← Define cómo estructura código
└── tech-stack.md                   ← Define qué herramientas usar

openspec/changes/
├── 001-initial-api-spec.md        ← Requerimientos iniciales
├── 002-complete-initial-spec.md   ← Plan de implementación (54 tareas)
├── 003-*.md                        ← Próximas fases
└── archive/                        ← Cambios completados

apps/api/src/
├── sheets/                         ← Implementa Module 1 (Scores)
├── instruments/                    ← Implementa Module 2 (Instruments)
├── records/                        ← Implementa Module 3 (Rehearsal Logs)
├── forums/                         ← Implementa Module 4 (Forums)
└── organizations/                  ← Implementa Module 5 (Organizations)
```

---

## Dashboard de Progreso (Ejemplo)

```
Music Folder Implementation Progress

Phase 1: Core API (Weeks 1-4)
  ✅ User Authentication
  ✅ Sheets Module (Endpoints 1.1-1.6)
  ✅ Instruments Module (Endpoints 2.1-2.4)
  ⏳ Records Module (Endpoints 3.1-3.7)
  ⏳ Forums Module (Endpoints 4.1-4.9)
  ⏳ Health/System Endpoints
  ⏳ Database Integration
  ⏳ Unit Tests

Phase 2: UI & Organizations (Weeks 5-8)
  ⏳ React Components
  ⏳ Organizations Module
  ⏳ E2E Tests
  ⏳ Production Deployment

Total Progress: 35% (18 of 54 tasks)
Next Task: Implement Records module
```

---

## NO Usar Estos Comandos (No Existen)

```bash
# ❌ NO existe - OpenSpec NO genera código automáticamente
openspec generate code

# ❌ NO existe
openspec compile

# ❌ NO existe
openspec transpile

# ✅ Lo que SÍ existe es:
openspec show                    # Ver specs
openspec status                  # Ver estado
openspec archive                 # Archivar cambios completados
```

---

## Checklist para Cada Tarea

- [ ] Leí la especificación relacionada
- [ ] Entiendo qué debe hacer esta tarea
- [ ] Creé las carpetas necesarias
- [ ] Implementé la Entity (si aplica)
- [ ] Implementé los DTOs
- [ ] Implementé el Service
- [ ] Implementé el Controller
- [ ] Registré el módulo en AppModule
- [ ] Inicié el servidor sin errores
- [ ] Probé endpoints con curl/Postman
- [ ] Comprobé contra Swagger (http://localhost:3000/docs)
- [ ] Agregué validaciones (class-validator)
- [ ] Escribí tests básicos
- [ ] Marqué tarea como completada

---

## Referencia Rápida

| Comando | Uso |
|---------|-----|
| `openspec show` | Ver especificación actual |
| `openspec show [name]` | Ver cambio específico |
| `openspec status --change [name]` | Ver tareas pendientes |
| `openspec archive [name]` | Archivar cambio completado |
| `openspec new change [name]` | Crear nuevo cambio |

---

## Conclusión

**OpenSpec NO compila ni genera código.** Es un gestor de especificaciones que:
- ✅ Organiza tus requerimientos
- ✅ Define qué hacer (specs)
- ✅ Lista tareas paso a paso
- ✅ Sirve como contrato entre team

**Tú escribes el código** basándote en las especificaciones. Las specs son tu "brújula" para saber exactamente qué implementar.

Para Music Folder:
1. **Lee las 6 especificaciones** en `openspec/specs/`
2. **Sigue las 54 tareas** en `openspec/changes/002-complete-initial-spec.md`
3. **Implementa el código** en `apps/api/src/`
4. **Prueba contra la especificación** para asegurar cumplimiento
5. **Archiva el cambio** cuando esté listo para la siguiente fase

¡El código que acabas de generar ya implementa Sheets e Instruments completamente!
