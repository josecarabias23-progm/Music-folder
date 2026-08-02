# Music Folder - Architecture & Implementation Guide

## Overview
Arquitectura recomendada para implementar Music Folder siguiendo best practices de desarrollo en monorepo (NestJS + React).

---

## Directory Structure for OpenSpec

```
openspec/
├── config.yaml
├── specs/
│   ├── music-folder.md                    # Main spec overview
│   ├── data-models.md                     # Entity definitions
│   ├── api-endpoints.md                   # REST API specification
│   ├── architecture.md                    # THIS FILE - system design
│   ├── tech-stack.md                      # Technology choices
│   └── security.md                        # Security & auth requirements
├── changes/
│   ├── 001-initial-api-spec.md           # Phase 1: Core API
│   ├── 002-instruments-forum.md          # Phase 2: Instruments & Forums
│   ├── 003-organizations.md              # Phase 3: Team/Organization features
│   └── archive/
└── decisions/
    └── adr-001-monorepo-structure.md      # Architecture Decision Records
```

---

## Backend Architecture (NestJS)

### Module Organization

```
apps/api/src/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── main.ts
├── config/                          # Configuration & environment
│   ├── database.config.ts
│   ├── storage.config.ts
│   └── auth.config.ts
├── common/                          # Shared across modules
│   ├── decorators/
│   │   ├── public.decorator.ts      # @Public() - bypass auth
│   │   ├── auth.decorator.ts        # @Auth() - get current user
│   │   └── roles.decorator.ts       # @Roles() - role-based access
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   └── exceptions/
│       ├── validation.exception.ts
│       └── resource-not-found.exception.ts
├── auth/                           # Authentication & JWT
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   └── entities/
│       └── jwt-payload.entity.ts
├── users/                          # User management
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user.dto.ts (DTO para respuestas)
│   └── entities/
│       └── user.entity.ts
├── sheets/                         # Scores / Partituras
│   ├── sheets.module.ts
│   ├── sheets.service.ts
│   ├── sheets.controller.ts
│   ├── dto/
│   │   ├── create-sheet.dto.ts
│   │   ├── update-sheet.dto.ts
│   │   ├── filter-sheets.query.ts
│   │   └── sheet.dto.ts
│   ├── entities/
│   │   ├── sheet.entity.ts
│   │   └── sheet-instrument.entity.ts (join table)
│   └── storage/
│       └── sheet-storage.service.ts
├── instruments/                    # Instruments Encyclopedia
│   ├── instruments.module.ts
│   ├── instruments.service.ts
│   ├── instruments.controller.ts
│   ├── dto/
│   │   ├── create-instrument.dto.ts
│   │   ├── instrument.dto.ts
│   │   └── filter-instruments.query.ts
│   └── entities/
│       └── instrument.entity.ts
├── records/                        # Rehearsal Logs
│   ├── records.module.ts
│   ├── records.service.ts
│   ├── records.controller.ts
│   ├── dto/
│   │   ├── create-rehearsal-log.dto.ts
│   │   ├── update-rehearsal-log.dto.ts
│   │   ├── attendance.dto.ts
│   │   └── rehearsal-log.dto.ts
│   ├── entities/
│   │   ├── rehearsal-log.entity.ts
│   │   ├── rehearsal-participant.entity.ts
│   │   └── attendance-record.entity.ts
│   └── storage/
│       └── audio-storage.service.ts
├── forums/                         # Community Forum
│   ├── forums.module.ts
│   ├── forums.service.ts
│   ├── forums.controller.ts
│   ├── dto/
│   │   ├── create-thread.dto.ts
│   │   ├── create-comment.dto.ts
│   │   ├── update-comment.dto.ts
│   │   ├── thread.dto.ts
│   │   └── comment.dto.ts
│   ├── entities/
│   │   ├── forum-thread.entity.ts
│   │   ├── forum-comment.entity.ts
│   │   └── comment-like.entity.ts
│   └── moderation/
│       └── forum-moderation.service.ts
├── organizations/                  # Teams/Bands/Orchestras
│   ├── organizations.module.ts
│   ├── organizations.service.ts
│   ├── organizations.controller.ts
│   ├── dto/
│   │   ├── create-organization.dto.ts
│   │   ├── organization.dto.ts
│   │   └── organization-member.dto.ts
│   └── entities/
│       ├── organization.entity.ts
│       └── organization-member.entity.ts
└── database/                       # TypeORM / Database
    ├── migrations/
    │   ├── 001-initial-schema.ts
    │   ├── 002-add-scores.ts
    │   ├── 003-add-forums.ts
    │   └── ...
    ├── seeders/
    │   ├── instruments.seeder.ts
    │   └── sample-data.seeder.ts
    └── ormconfig.ts
```

### Key Technologies
- **Framework**: NestJS
- **Database**: PostgreSQL (recommended) or MySQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport.js
- **File Storage**: S3-compatible storage (AWS S3, MinIO, Cloudinary)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI (NestJS Swagger module)

---

## Frontend Architecture (React + Vite)

### Component Organization

```
apps/web/src/
├── main.tsx
├── index.css
├── App.tsx
├── vite.config.ts
├── api/                            # API client layer
│   ├── client.ts                   # Axios/Fetch wrapper
│   ├── auth.api.ts                 # Authentication endpoints
│   ├── sheets.api.ts               # Score endpoints
│   ├── instruments.api.ts
│   ├── records.api.ts
│   ├── forums.api.ts
│   └── organizations.api.ts
├── types/                          # TypeScript types & interfaces
│   ├── auth.types.ts
│   ├── score.types.ts
│   ├── instrument.types.ts
│   ├── rehearsal.types.ts
│   ├── forum.types.ts
│   └── organization.types.ts
├── hooks/                          # Custom React hooks
│   ├── useAuth.ts
│   ├── useSheets.ts
│   ├── useForumThreads.ts
│   ├── usePagination.ts
│   └── ...
├── stores/                         # State management (Zustand/Redux)
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── ...
├── pages/                          # Page components (routing)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ScoresPage.tsx
│   ├── InstrumentDetailPage.tsx
│   ├── ForumPage.tsx
│   ├── OrganizationPage.tsx
│   └── ...
├── components/                     # Reusable components
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── scores/
│   │   ├── ScoreCard.tsx
│   │   ├── ScoreUploadForm.tsx
│   │   ├── ScoreDetailModal.tsx
│   │   └── ScoreDownloadButton.tsx
│   ├── instruments/
│   │   ├── InstrumentCard.tsx
│   │   ├── InstrumentList.tsx
│   │   └── InstrumentDetail.tsx
│   ├── forums/
│   │   ├── ThreadCard.tsx
│   │   ├── ThreadList.tsx
│   │   ├── CommentThread.tsx
│   │   ├── CommentForm.tsx
│   │   └── CreateThreadModal.tsx
│   ├── records/
│   │   ├── RehearsalLogCard.tsx
│   │   ├── RehearsalLogForm.tsx
│   │   └── AttendanceManager.tsx
│   └── organizations/
│       ├── OrganizationCard.tsx
│       ├── OrganizationForm.tsx
│       └── MemberManagement.tsx
├── layouts/                        # Layout components
│   ├── MainLayout.tsx
│   └── AuthLayout.tsx
├── utils/                          # Utility functions
│   ├── date.utils.ts
│   ├── format.utils.ts
│   ├── validation.utils.ts
│   └── auth.utils.ts
├── styles/                         # Global styles
│   ├── global.css
│   ├── variables.css
│   └── tailwind.config.js (if using Tailwind)
└── constants/
    ├── api.constants.ts
    ├── routes.constants.ts
    └── messages.constants.ts
```

### Frontend Technologies
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (or styled-components)
- **HTTP Client**: Axios or Fetch API
- **State Management**: Zustand (lightweight) or Redux Toolkit
- **Form Management**: React Hook Form
- **UI Components**: Custom or Material-UI / Shadcn/UI
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library

---

## Database Schema (TypeORM Entities)

### Core Tables

```
users
├── id (UUID, PK)
├── email (unique)
├── username (unique)
├── password_hash
├── first_name, last_name
├── role (enum)
├── instruments (JSON array or relation)
├── created_at, updated_at

organizations
├── id (UUID, PK)
├── name
├── description
├── type (enum)
├── founder_id (FK → users)
├── created_at, updated_at

organization_members (join table)
├── organization_id (FK)
├── user_id (FK)
├── role (string, e.g., "Violin I")
├── joined_at

scores
├── id (UUID, PK)
├── title
├── composer
├── arranger
├── owner_id (FK → users)
├── organization_id (FK → organizations, nullable)
├── file_url
├── file_format (enum)
├── file_size
├── instrument_role
├── difficulty_level
├── key_signature, time_signature
├── duration_minutes
├── is_public
├── created_at, updated_at

score_instruments (join table, optional)
├── score_id (FK)
├── instrument_id (FK)

instruments
├── id (UUID, PK)
├── name
├── family (enum)
├── transposition
├── is_transposing
├── range_data (JSON)
├── techniques (JSON array)
├── maintenance_tips
├── created_at, updated_at

rehearsal_logs
├── id (UUID, PK)
├── title
├── date (datetime)
├── duration_minutes
├── conductor_id (FK → users)
├── organization_id (FK, nullable)
├── location
├── type (enum)
├── notes
├── focus_areas (JSON array)
├── audio_reference_url
├── created_at, updated_at

rehearsal_participants (join table)
├── rehearsal_log_id (FK)
├── user_id (FK)
├── present (boolean)

rehearsal_scores (join table)
├── rehearsal_log_id (FK)
├── score_id (FK)

forum_threads
├── id (UUID, PK)
├── title
├── description
├── category (enum)
├── created_by (FK → users)
├── is_pinned
├── is_locked
├── view_count
├── created_at, updated_at

forum_comments
├── id (UUID, PK)
├── thread_id (FK)
├── author_id (FK → users)
├── parent_comment_id (FK, nullable)
├── content
├── likes_count
├── is_edited
├── created_at, updated_at

comment_likes (join table)
├── comment_id (FK)
├── user_id (FK)
├── created_at (unique constraint on comment_id + user_id)
```

---

## API Documentation

### Swagger Integration
```typescript
// apps/api/src/main.ts
const config = new DocumentBuilder()
  .setTitle('Music Folder API')
  .setDescription('API for musicians and orchestras')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

### Accessible at: `http://localhost:3000/docs`

---

## File Storage Strategy

### Endpoints Configuration
```typescript
// Local development (MinIO or LocalStack)
Storage: file:///uploads/

// AWS S3 (Production)
Bucket: music-folder-prod
Region: us-east-1
CDN: CloudFront

// Alternative: Cloudinary (simplest)
Account: music-folder-account
```

### Upload Flow
1. Frontend requests presigned URL from backend
2. Backend generates signed URL for S3
3. Frontend uploads file directly to S3
4. Frontend confirms to backend with file key
5. Backend stores metadata in database

---

## Security Architecture

### Authentication
- JWT tokens with 24-hour expiration
- Refresh token rotation (7 days)
- HttpOnly cookies for token storage (web frontend)

### Authorization
- Role-Based Access Control (RBAC)
- Roles: `admin`, `conductor`, `musician`, `guest`
- Organization-level permissions

### Input Validation
- DTO-based validation (class-validator)
- File upload size limits (50MB)
- SQL injection prevention (via TypeORM)
- XSS protection (React auto-escapes)
- CORS policy configuration

### Data Protection
- Password hashing (bcrypt)
- PII encryption at rest (optional)
- HTTPS/TLS in transit
- Database backups

---

## Deployment Architecture

### Development
```
npm run bootstrap    # Install all dependencies
npm run start:dev   # Start both API (port 3000) and Web (port 5173)
```

### Production
```
Docker setup:
├── api-service (NestJS on port 3000)
├── web-service (React+Vite static on port 5173)
├── postgres-database
└── nginx-reverse-proxy (port 80/443)

OR

Vercel deployment (frontend) + Render/Heroku (backend)
```

---

## Monitoring & Logging

### Backend Logging
```typescript
import { Logger } from '@nestjs/common';

// Use in services
private readonly logger = new Logger(SheetService.name);
this.logger.log('Score uploaded', { userId, scoreId });
```

### Frontend Error Tracking
```typescript
// Sentry integration for error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
});
```

---

## Testing Strategy

### Backend (NestJS)
- **Unit Tests**: Jest (services, pipes, guards)
- **Integration Tests**: Jest + TypeORM test database
- **E2E Tests**: Supertest

### Frontend (React)
- **Unit Tests**: Vitest + React Testing Library
- **Component Tests**: Storybook
- **E2E Tests**: Playwright or Cypress

---

## Performance Optimization

### Backend
- Database indexing on frequently queried columns (email, username, created_at)
- Caching layer (Redis) for instruments data
- Pagination for all list endpoints
- Query optimization (eager loading with TypeORM relations)

### Frontend
- Code splitting (lazy loading of pages)
- Image optimization (WebP with fallbacks)
- Memoization of expensive components
- Service Worker for offline support (optional)

---

## Scalability Considerations

### Phase 1 (MVP)
- Single PostgreSQL database
- File storage (S3 or local)
- No caching

### Phase 2 (Growth)
- Redis for session management
- Database read replicas
- CDN for static assets
- Elastic search for forum search

### Phase 3 (Scale)
- Microservices architecture
- Message queue (RabbitMQ/Kafka)
- Database sharding
- Load balancing
