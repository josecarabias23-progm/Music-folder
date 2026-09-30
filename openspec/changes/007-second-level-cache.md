# Change #7: Second-Level Cache (L2 Cache) with Redis Specification

## Summary
Formal OpenSpec technical proposal and specification for implementing a Second-Level Cache (L2 Cache) architecture with Redis in the NestJS backend (`apps/api`), offloading database reads from PostgreSQL, providing resilient fail-open fallbacks, and integrating post-commit cache invalidation with the Unit of Work pattern (Spec 006).

---

## Technical Specification Document

The full technical specification is documented in the main spec file:
👉 **[`openspec/specs/second-level-cache.md`](../specs/second-level-cache.md)**

---

## High-Level Proposal Overview

### 1. Context & Rationale
High-frequency GET requests (`/instruments`, public `/sheets`, `/groups/:id/members`) currently execute direct SELECT queries on PostgreSQL. Adding an L2 Cache layer powered by Redis and the Cache-Aside pattern reduces database load, drops p95 response latencies to < 10ms, and improves application throughput.

### 2. Key Architecture Elements
- **Cache-Aside Pattern & Resiliency**: Automatic fail-open fallback to PostgreSQL if Redis is offline or timed out (>150ms).
- **Post-Commit Invalidation**: Cache purges are executed *after* successful database transactions in `UnitOfWork` (Spec 006), preventing ghost invalidations if a transaction rolls back.
- **Key Strategy**: Structured versioned namespaces (`musicfolder:v1:<entity>:<id>`) with explicit TTLs (24h for instruments, 10m for scores, 5m for group members).

### 3. Pilot Candidate Endpoints
- `GET /api/v1/instruments`
- `GET /api/v1/sheets`
- `GET /api/v1/groups/:id/members`

### 4. Infrastructure Requirements
- Add `redis` service (redis:7-alpine) to `docker-compose.yml`.
- Add `REDIS_URL` and `CACHE_ENABLED` environment variables to `render.yaml` and `.env.example`.
