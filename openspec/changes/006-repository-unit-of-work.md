# Change #6: Repository & Unit of Work (UoW) Pattern Technical Specification

## Summary
Formal OpenSpec technical proposal and specification for implementing the Repository Pattern (`IBaseRepository<T>`) and Unit of Work Pattern (`IUnitOfWork`) in the NestJS backend (`apps/api`), enabling atomic multi-entity transactions, eliminating direct TypeORM coupling in domain services, and preventing PostgreSQL connection pool leaks.

---

## Technical Specification Document

The full technical specification is documented in the main spec file:
👉 **[`openspec/specs/repository-unit-of-work.md`](../specs/repository-unit-of-work.md)**

---

## High-Level Proposal Overview

### 1. Context & Rationale
Currently, domain services in `apps/api` inject TypeORM `Repository<T>` directly via `@InjectRepository()`. Multi-entity atomic operations (such as group creation + initial director membership, or score import + notification generation) either lack transaction boundaries or rely on manual `QueryRunner` management, creating risks of connection leaks if `release()` is missed.

### 2. Proposed Design
- **`IBaseRepository<T>` Interface**: Decouples services from TypeORM implementation details.
- **`IUnitOfWork` Interface & `TypeOrmUnitOfWork` Implementation**: Encloses multi-repository operations inside `runInTransaction(async (uow) => { ... })` with guaranteed `try/catch/finally` cleanup.
- **Mockability**: Provides `MockUnitOfWork` for unit testing domain logic without database connections.

### 3. Critical Use Cases
- `GroupsService.createGroup`: Group creation + initial director `GroupMember`.
- `ScoresService.importPublicScore`: Score creation + `Notification` generation.
- `RecordsService.recordAttendance`: Rehearsal record + attendance status + notification.

### 4. Implementation Phasing
- **Phase 1**: Core interfaces and `DatabaseModule` in `apps/api/src/common/database/`.
- **Phase 2**: `TypeOrmUnitOfWork` provider implementation.
- **Phase 3**: Refactoring `GroupsModule`, `ScoresModule`, `RecordsModule`.
- **Phase 4**: Unit testing with `MockUnitOfWork`.
