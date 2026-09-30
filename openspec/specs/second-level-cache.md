# Specification: Second-Level Cache (L2 Cache) Architecture for `apps/api`

## Status
- **Status**: Proposed / Approved Specification
- **Target Component**: `apps/api` (NestJS / TypeORM / Redis / PostgreSQL)
- **Author**: Senior Backend Architecture Team

---

## 1. Benchmarking & Library Comparison

### 1.1 Context & Problem Statement
In `apps/api`, every read request for static or semi-static domain resources (`/instruments`, public `/sheets`, `/groups/:id/members`) hits PostgreSQL directly. As active users, public score searches, and group members increase, database query latency and connection pool utilization grow linearly.

Implementing a **Second-Level Cache (L2 Cache)** with Redis reduces PostgreSQL read pressure, speeds up response times (< 10ms for cache hits), and provides high-availability fail-open resiliency.

---

### 1.2 Evaluation & Comparison Matrix

| Criterio | TypeORM Native Cache (`cache: true` + `ioredis`) | NestJS Cache Manager (`@nestjs/cache-manager` + `cache-manager-ioredis-yet`) | Specialized Wrappers (`typeorm-cache-redis`) | Custom CacheService (Cache-Aside + Redis `ioredis`) [SELECCIONADO] |
| :--- | :--- | :--- | :--- | :--- |
| **Compatibilidad NestJS / TypeORM v0.3+** | ⚠️ Parcial (requiere arreglos manuales en `DataSourceOptions`) | ✅ Excelente (Nativo de NestJS) | ❌ Pobre (Librerías desactualizadas o abandonadas) | ✅ 100% Control de tipos e integración NestJS |
| **Granularidad de Invalidación (Tags/Patterns)** | ⚠️ Pobre (solo expira por tiempo o clave única) | ⚠️ Moderada (limpieza global o clave única) | ❌ Inexistente | ✅ Alta (soporta wildcard purging via Redis SCAN/SETS) |
| **Integración con Unit of Work (Spec 006)** | ❌ Ninguna (se invalida inmediatamente en la consulta) | ❌ Ninguna (desconectado de transacciones) | ❌ Ninguna | ✅ Integración nativa Post-Commit (evita ghost invalidations) |
| **Resiliencia & Fail-Open (Redis Offline)** | ❌ Lanza excepción y falla el endpoint | ⚠️ Silencioso pero rígido | ❌ Falla la consulta | ✅ Fallback automático e ininterrumpido a PostgreSQL |
| **Facilidad de Testing Unitario** | ❌ Difícil (requiere mockear `QueryBuilder.cache()`) | ⚠️ Moderada | ❌ Muy Difícil | ✅ Muy Fácil (mock de `ICacheService`) |

#### Decisión Arquitectónica
Adoptar una arquitectura de **L2 Cache basada en un `CacheService` personalizado impulsado por `ioredis` y `@nestjs/cache-manager`**, operando bajo el patrón **Cache-Aside** con integración **Post-Commit** dentro del `UnitOfWork` (definido en Spec 006).

---

## 2. Data Architecture & Key Strategy

### 2.1 Key Formatting Convention
Todas las claves almacenadas en Redis seguirán una convención de nombres estructurada y versionada con namespace:

$$\text{Format: } \texttt{musicfolder:<namespace>:<entity>:<identifier\_or\_query>}$$

#### Ejemplos:
* **Entidades Semi-Estáticas**: `musicfolder:v1:instruments:all`
* **Entidades Dinámicas por ID**: `musicfolder:v1:scores:detail:score-123`
* **Relaciones de Grupo**: `musicfolder:v1:groups:members:group-456`
* **Sets de Etiquetas para Invalidación por Dominio**: `musicfolder:v1:tags:groups:group-456`

---

### 2.2 Volatility & TTL Policies

| Categoria | Tipo de Recurso | TTL Recomendado | Estrategia de Invalación |
| :--- | :--- | :--- | :--- |
| **Semi-Estático** | `/instruments` (Enciclopedia de instrumentos) | **24 Horas** (86,400s) | Invalación explícita ante mutación de catálogo (Admin). |
| **Dinámico Compartido** | `/sheets` (Partituras públicas y de agrupación) | **10 Minutos** (600s) | Invalación Post-Commit al subir, editar o eliminar partituras. |
| **Relacional de Grupo** | `/groups/:id/members`, `/groups/:id/library` | **5 Minutos** (300s) | Invalación por patrón de etiqueta (`tags:groups:groupId`) al modificar miembros/recursos. |
| **Altamente Volátil** | `/notifications` (Centro de notificaciones) | **1 Minuto** (60s) o No Cache | Invalación directa al emitir notificaciones o marcar como leídas. |

---

## 3. Cache Invalidation Strategy

### 3.1 Ghost Invalidation Problem & Post-Commit Integration
Si una clave de caché se invalida inmediatamente al iniciar una transacción en el `UnitOfWork`, y posteriormente dicha transacción falla y realiza `ROLLBACK`, la caché habrá sido purgada indebidamente (Invalidación Fantasma).

```mermaid
sequenceDiagram
    autonumber
    actor Service as Service / UoW
    participant UoW as TypeOrmUnitOfWork
    participant DB as PostgreSQL
    participant Cache as CacheService (Redis)

    Service->>UoW: runInTransaction(work)
    UoW->>DB: BEGIN TRANSACTION
    Service->>DB: INSERT / UPDATE Entity
    Service->>UoW: registerPostCommitTask(() => cache.invalidate(tag))
    alt Transaction Succeeds
        UoW->>DB: COMMIT TRANSACTION
        UoW->>Cache: Execute Post-Commit Invalidation (DEL / PURGE)
    else Transaction Fails (Rollback)
        UoW->>DB: ROLLBACK TRANSACTION
        Note over UoW,Cache: Post-Commit tasks ARE NOT EXECUTED. Cache remains clean!
    end
```

---

### 3.2 Evaluation: Entity Subscribers vs Event-Driven Invalidation
* **TypeORM Entity Subscribers**:
  - *Desventaja*: Se ejecutan dentro de la transacción de TypeORM antes de confirmar el COMMIT real en la base de datos, lo que puede causar desincronizaciones si la conexión física a Postgres falla al confirmar.
* **Invalidación Explícita Orientada a Eventos / Post-Commit [SELECCIONADO]**:
  - Se registra la tarea de invalidación dentro del `UnitOfWork` mediante `registerPostCommitTask()`, asegurando que Redis se purgue **únicamente tras la confirmación exitosa de PostgreSQL**.

---

## 4. Resilience, Fallback & Monitoring (Cache-Aside Pattern)

### 4.1 Fail-Open Resiliency (Redis Outage Circuit Break)
El backend nunca debe fallar ni retornar error HTTP 500 ante interrupciones de red o caídas del servicio Redis.

```mermaid
flowchart TD
    A[HTTP GET Request] --> B{CacheService.get}
    B -- Redis Online & Hit --> C[Return Cached JSON Response]
    B -- Redis Miss / Timeout / Offline --> D[Query PostgreSQL Database]
    D --> E[Return Database Entity Result]
    D -. Async Optional .- F[Write to Redis with TTL]
```

#### Código Conceptual de Resiliencia:
```typescript
async get<T>(key: string): Promise<T | null> {
  try {
    const data = await Promise.race([
      this.redisClient.get(key),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Redis Timeout')), 150)),
    ]);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    this.logger.warn(`Redis GET failed for key "${key}". Failing open to PostgreSQL. Reason: ${error.message}`);
    this.metrics.increment('cache.redis.fail_open');
    return null; // Fallback automático a base de datos
  }
}
```

---

### 4.2 Metrics & Observability
Se registrarán los siguientes indicadores clave (KPIs):
* **Cache Hit Ratio**: $\frac{\text{Hits}}{\text{Hits} + \text{Misses}} \times 100\%$ (Meta: $> 80\%$ en endpoints leídos frecuentemente).
* **Fail-Open Fallback Count**: Número de veces que PostgreSQL respondió debido a un timeout o caída de Redis.
* **Latency Overhead**: Tiempo de respuesta de operaciones Redis (Meta: $< 5\text{ms}$).

---

## 5. Adoption & Infrastructure Plan

### 5.1 Local Infrastructure (`docker-compose.yml`)
Se añadirá el contenedor de Redis en `docker-compose.yml`:

```yaml
  redis:
    image: redis:7-alpine
    container_name: music-folder-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### 5.2 Deployment Configuration (`render.yaml`)
Se añadirán las variables de entorno para Render y producción:
* `REDIS_URL`: URL de conexión segura a Redis (ej. `redis://default:password@host:port`).
* `CACHE_ENABLED`: Flag booleano (`true`/`false`) para habilitar o deshabilitar la capa de caché fácilmente.

### 5.3 Candidate Endpoints for Pilot Rollout
1. **Fase 1 (Piloto)**: `GET /api/v1/instruments` (Datos semi-estáticos).
2. **Fase 2**: `GET /api/v1/sheets` y `GET /api/v1/sheets/:id` (Partituras).
3. **Fase 3**: `GET /api/v1/groups/:id/members` y `GET /api/v1/groups/:id/community` (Espacio de trabajo).
