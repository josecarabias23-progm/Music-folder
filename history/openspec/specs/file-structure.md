# File Structure Guide - Music Folder

## Project Organization Strategy

This guide explains the recommended file structure for Music Folder, organized for scalability and maintainability using a monorepo pattern with npm workspaces.

---

## Root Directory Structure

```
music-folder/
├── .github/
│   ├── workflows/                    # GitHub Actions CI/CD
│   │   ├── test.yml
│   │   ├── build.yml
│   │   ├── deploy.yml
│   │   └── security-audit.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── openspec/                         # OpenSpec specifications (spec-driven)
│   ├── config.yaml                  # OpenSpec configuration
│   ├── specs/                       # Main specifications
│   │   ├── music-folder.md          # Project overview
│   │   ├── data-models.md           # Entity definitions
│   │   ├── api-endpoints.md         # REST API spec
│   │   ├── architecture.md          # System design
│   │   ├── tech-stack.md            # Technology choices
│   │   └── security.md              # Security requirements
│   ├── changes/                     # OpenSpec changes (features/phases)
│   │   ├── 001-initial-api-spec.md
│   │   ├── 002-complete-initial-spec.md
│   │   ├── 003-[feature-name].md
│   │   └── archive/                 # Completed changes
│   └── decisions/                   # Architecture Decision Records
│       ├── adr-001-monorepo-structure.md
│       ├── adr-002-jwt-authentication.md
│       └── adr-003-tech-stack-choices.md
├── apps/
│   ├── api/                         # NestJS Backend
│   │   ├── package.json
│   │   ├── Procfile                 # Heroku/Render deployment
│   │   ├── Dockerfile              # Container image
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── jest.config.ts           # Testing configuration
│   │   ├── .eslintrc.json
│   │   ├── .env.example
│   │   ├── src/
│   │   │   ├── main.ts              # Entry point
│   │   │   ├── app.module.ts        # Root module
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   ├── config/              # Configuration
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── jwt.config.ts
│   │   │   │   └── storage.config.ts
│   │   │   ├── common/              # Shared utilities
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── public.decorator.ts
│   │   │   │   │   ├── auth.decorator.ts
│   │   │   │   │   └── roles.decorator.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── logging.interceptor.ts
│   │   │   │   └── exceptions/
│   │   │   │       └── custom-exceptions.ts
│   │   │   ├── auth/                # Authentication module
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       ├── register.dto.ts
│   │   │   │       └── token-response.dto.ts
│   │   │   ├── users/               # Users module
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.entity.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-user.dto.ts
│   │   │   │       ├── update-user.dto.ts
│   │   │   │       └── user-response.dto.ts
│   │   │   ├── sheets/              # Scores/Partituras module
│   │   │   │   ├── sheets.module.ts
│   │   │   │   ├── sheets.controller.ts
│   │   │   │   ├── sheets.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── sheet.entity.ts
│   │   │   │   │   └── sheet-instrument.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-sheet.dto.ts
│   │   │   │   │   ├── update-sheet.dto.ts
│   │   │   │   │   ├── list-sheets-query.dto.ts
│   │   │   │   │   └── sheet-response.dto.ts
│   │   │   │   ├── storage/
│   │   │   │   │   └── sheet-storage.service.ts
│   │   │   │   └── spec/            # OpenAPI documentation
│   │   │   │       └── sheets.spec.md
│   │   │   ├── instruments/         # Instruments Encyclopedia module
│   │   │   │   ├── instruments.module.ts
│   │   │   │   ├── instruments.controller.ts
│   │   │   │   ├── instruments.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── instrument.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-instrument.dto.ts
│   │   │   │   │   ├── list-instruments-query.dto.ts
│   │   │   │   │   └── instrument-response.dto.ts
│   │   │   │   └── seed/
│   │   │   │       └── instruments.seed.ts
│   │   │   ├── records/             # Rehearsal Logs module
│   │   │   │   ├── records.module.ts
│   │   │   │   ├── records.controller.ts
│   │   │   │   ├── records.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── rehearsal-log.entity.ts
│   │   │   │   │   ├── rehearsal-participant.entity.ts
│   │   │   │   │   └── attendance.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-rehearsal-log.dto.ts
│   │   │   │   │   ├── update-rehearsal-log.dto.ts
│   │   │   │   │   ├── attendance.dto.ts
│   │   │   │   │   └── rehearsal-log-response.dto.ts
│   │   │   │   ├── storage/
│   │   │   │   │   └── audio-storage.service.ts
│   │   │   │   └── spec/
│   │   │   │       └── records.spec.md
│   │   │   ├── forums/              # Community Forum module
│   │   │   │   ├── forums.module.ts
│   │   │   │   ├── forums.controller.ts
│   │   │   │   ├── forums.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── forum-thread.entity.ts
│   │   │   │   │   ├── forum-comment.entity.ts
│   │   │   │   │   └── comment-like.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-thread.dto.ts
│   │   │   │   │   ├── create-comment.dto.ts
│   │   │   │   │   ├── update-comment.dto.ts
│   │   │   │   │   ├── thread-response.dto.ts
│   │   │   │   │   └── comment-response.dto.ts
│   │   │   │   └── spec/
│   │   │   │       └── forums.spec.md
│   │   │   ├── organizations/       # Teams/Bands/Orchestras module
│   │   │   │   ├── organizations.module.ts
│   │   │   │   ├── organizations.controller.ts
│   │   │   │   ├── organizations.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── organization.entity.ts
│   │   │   │   │   └── organization-member.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-organization.dto.ts
│   │   │   │   │   ├── add-member.dto.ts
│   │   │   │   │   └── organization-response.dto.ts
│   │   │   │   └── spec/
│   │   │   │       └── organizations.spec.md
│   │   │   └── database/            # Database layer
│   │   │       ├── migrations/
│   │   │       │   ├── 1704067200000-CreateUsers.ts
│   │   │       │   ├── 1704067300000-CreateScores.ts
│   │   │       │   ├── 1704067400000-CreateInstruments.ts
│   │   │       │   ├── 1704067500000-CreateForums.ts
│   │   │       │   ├── 1704067600000-CreateRehearsals.ts
│   │   │       │   └── 1704067700000-CreateOrganizations.ts
│   │   │       ├── seeds/
│   │   │       │   ├── 001-instruments.seed.ts
│   │   │       │   └── 002-sample-data.seed.ts
│   │   │       └── ormconfig.ts
│   │   ├── test/                    # Test files
│   │   │   ├── app.e2e-spec.ts      # E2E tests
│   │   │   ├── auth.e2e-spec.ts
│   │   │   ├── sheets.e2e-spec.ts
│   │   │   └── ...
│   │   ├── dist/                    # Built output (gitignored)
│   │   ├── node_modules/            # Dependencies (gitignored)
│   │   └── README.md
│   │
│   ├── web/                         # React Frontend
│   │   ├── package.json
│   │   ├── vite.config.ts           # Vite configuration
│   │   ├── vercel.json              # Vercel deployment
│   │   ├── tsconfig.json
│   │   ├── .eslintrc.json
│   │   ├── .env.example
│   │   ├── index.html               # Entry HTML
│   │   ├── src/
│   │   │   ├── main.tsx             # React root
│   │   │   ├── App.tsx              # Main app component
│   │   │   ├── index.css            # Global styles
│   │   │   ├── api/                 # API client layer
│   │   │   │   ├── client.ts        # Axios configuration
│   │   │   │   ├── auth.api.ts      # Auth endpoints
│   │   │   │   ├── sheets.api.ts    # Scores endpoints
│   │   │   │   ├── instruments.api.ts
│   │   │   │   ├── records.api.ts   # Rehearsal endpoints
│   │   │   │   ├── forums.api.ts
│   │   │   │   └── organizations.api.ts
│   │   │   ├── types/               # TypeScript types
│   │   │   │   ├── auth.types.ts
│   │   │   │   ├── score.types.ts
│   │   │   │   ├── instrument.types.ts
│   │   │   │   ├── rehearsal.types.ts
│   │   │   │   ├── forum.types.ts
│   │   │   │   └── organization.types.ts
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useSheets.ts
│   │   │   │   ├── useInstruments.ts
│   │   │   │   ├── useRecords.ts
│   │   │   │   ├── useForums.ts
│   │   │   │   ├── usePagination.ts
│   │   │   │   └── ...
│   │   │   ├── stores/              # Zustand stores
│   │   │   │   ├── auth.store.ts
│   │   │   │   ├── ui.store.ts      # Theme, layout state
│   │   │   │   └── ...
│   │   │   ├── pages/               # Page components
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── ScoresPage.tsx
│   │   │   │   ├── ScoreDetailPage.tsx
│   │   │   │   ├── InstrumentsPage.tsx
│   │   │   │   ├── InstrumentDetailPage.tsx
│   │   │   │   ├── RehearsalsPage.tsx
│   │   │   │   ├── RehearsalDetailPage.tsx
│   │   │   │   ├── ForumPage.tsx
│   │   │   │   ├── ThreadDetailPage.tsx
│   │   │   │   ├── OrganizationsPage.tsx
│   │   │   │   ├── OrganizationDetailPage.tsx
│   │   │   │   └── ProfilePage.tsx
│   │   │   ├── components/          # Reusable components
│   │   │   │   ├── common/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Navigation.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   │   └── ErrorBoundary.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── RegisterForm.tsx
│   │   │   │   ├── scores/
│   │   │   │   │   ├── ScoreCard.tsx
│   │   │   │   │   ├── ScoreGrid.tsx
│   │   │   │   │   ├── ScoreUploadForm.tsx
│   │   │   │   │   ├── ScoreDetailModal.tsx
│   │   │   │   │   ├── ScoreDownloadButton.tsx
│   │   │   │   │   └── ScoreFilterBar.tsx
│   │   │   │   ├── instruments/
│   │   │   │   │   ├── InstrumentCard.tsx
│   │   │   │   │   ├── InstrumentList.tsx
│   │   │   │   │   ├── InstrumentDetail.tsx
│   │   │   │   │   └── TranspositionCalculator.tsx
│   │   │   │   ├── forums/
│   │   │   │   │   ├── ThreadCard.tsx
│   │   │   │   │   ├── ThreadList.tsx
│   │   │   │   │   ├── CommentThread.tsx
│   │   │   │   │   ├── CommentForm.tsx
│   │   │   │   │   ├── CreateThreadModal.tsx
│   │   │   │   │   └── LikeButton.tsx
│   │   │   │   ├── records/
│   │   │   │   │   ├── RehearsalLogCard.tsx
│   │   │   │   │   ├── RehearsalLogForm.tsx
│   │   │   │   │   ├── RehearsalDetailView.tsx
│   │   │   │   │   ├── AttendanceTable.tsx
│   │   │   │   │   └── AttendanceManager.tsx
│   │   │   │   ├── organizations/
│   │   │   │   │   ├── OrganizationCard.tsx
│   │   │   │   │   ├── CreateOrganizationModal.tsx
│   │   │   │   │   ├── MemberManagement.tsx
│   │   │   │   │   └── OrganizationSettings.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── Pagination.tsx
│   │   │   │       ├── EmptyState.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       └── Tag.tsx
│   │   │   ├── layouts/             # Layout components
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── AuthLayout.tsx
│   │   │   ├── utils/               # Utility functions
│   │   │   │   ├── date.utils.ts
│   │   │   │   ├── format.utils.ts
│   │   │   │   ├── validation.utils.ts
│   │   │   │   ├── auth.utils.ts
│   │   │   │   └── file.utils.ts
│   │   │   ├── styles/              # Stylesheets
│   │   │   │   ├── global.css
│   │   │   │   ├── variables.css
│   │   │   │   └── tailwind.config.js
│   │   │   ├── constants/           # Constants
│   │   │   │   ├── api.constants.ts
│   │   │   │   ├── routes.constants.ts
│   │   │   │   └── messages.constants.ts
│   │   │   └── router/              # Route configuration
│   │   │       └── routes.tsx
│   │   ├── __tests__/               # Test files
│   │   │   ├── components/
│   │   │   │   ├── ScoreUploadForm.test.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   │   ├── useSheets.test.ts
│   │   │   │   └── ...
│   │   │   └── utils/
│   │   │       ├── date.utils.test.ts
│   │   │       └── ...
│   │   ├── dist/                    # Built output (gitignored)
│   │   ├── node_modules/            # Dependencies (gitignored)
│   │   └── README.md
│   │
│   └── README.md
│
├── packages/                        # Shared code packages
│   ├── backend/                     # Backend shared utilities
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── exceptions/
│   │   │   ├── utilities/
│   │   │   ├── types/
│   │   │   └── constants/
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── README.md
│
├── specs/                          # Legacy OpenAPI specs
│   ├── openapi.yaml                # Complete API OpenAPI v3 spec
│   └── README.md
│
├── docker/                         # Docker configurations
│   ├── api.dockerfile              # API Docker image
│   ├── web.dockerfile              # Web Docker image
│   └── docker-compose.yml          # Local development stack
│
├── docs/                           # Project documentation
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   └── API-TESTING.md
│
├── .github/                        # GitHub-specific
│   └── workflows/
│       ├── ci.yml                  # Continuous Integration
│       ├── deploy.yml              # Deployment workflow
│       └── security.yml            # Security scanning
│
├── .gitignore
├── .editorconfig
├── .prettierrc                     # Prettier config (shared)
├── .eslintrc.json                 # ESLint config (root level)
├── package.json                   # Root monorepo config
├── package-lock.json              # Lock file (do not edit manually)
├── tsconfig.json                  # Root TypeScript config
├── README.md                       # Project overview
├── LICENSE
└── CHANGELOG.md
```

---

## File Naming Conventions

### Backend (NestJS)

| Type | Pattern | Example |
|------|---------|---------|
| Module | `{feature}.module.ts` | `sheets.module.ts` |
| Controller | `{feature}.controller.ts` | `sheets.controller.ts` |
| Service | `{feature}.service.ts` | `sheets.service.ts` |
| Entity | `{feature}.entity.ts` | `sheet.entity.ts` |
| DTO | `{action}-{feature}.dto.ts` | `create-sheet.dto.ts`, `sheet-response.dto.ts` |
| Spec | `{feature}.spec.md` | `sheets.spec.md` (OpenAPI docs) |
| Tests | `{feature}.spec.ts` | `sheets.service.spec.ts` |
| Config | `{service}.config.ts` | `database.config.ts`, `jwt.config.ts` |

### Frontend (React)

| Type | Pattern | Example |
|------|---------|---------|
| Page | `{Name}Page.tsx` | `ScoresPage.tsx` |
| Component | `{Name}.tsx` | `ScoreCard.tsx` |
| Hook | `use{Name}.ts` | `useSheets.ts` |
| Store | `{feature}.store.ts` | `auth.store.ts` |
| API | `{feature}.api.ts` | `sheets.api.ts` |
| Type | `{feature}.types.ts` | `score.types.ts` |
| Utility | `{feature}.utils.ts` | `date.utils.ts` |
| Test | `{name}.test.tsx` or `.spec.tsx` | `ScoreCard.test.tsx` |

---

## Best Practices

### Backend File Organization

1. **One responsibility per file**: Services, controllers, entities are separate
2. **DTO per action**: `create-sheet.dto.ts`, `update-sheet.dto.ts`, `sheet-response.dto.ts`
3. **Entity files**: Define TypeORM entities with decorators and relations
4. **Test co-location**: Test files in same directory as source, or dedicated `test/` folder
5. **Config modules**: Centralized configuration in `config/` folder

### Frontend File Organization

1. **Component co-location**: Components with their styles/tests in subdirectories
2. **Feature-based structure**: Group by feature (scores, forums) not by type
3. **Shared components**: Reusable components in `components/shared/`
4. **Page-level logic**: Page components handle routing and state initialization
5. **Hook extraction**: Complex logic extracted to custom hooks

### Database

1. **Migrations**: Timestamped files with clear names
2. **Seeds**: Separate seed files for different data types
3. **Entity order**: Base entities first, then relations

---

## Growth & Expansion

### When to Create New Modules

Add a new module when:
- Feature has distinct domain logic
- Multiple controllers/services needed
- Can be tested independently
- Might be reused elsewhere

### When to Add to `packages/`

Move to packages when:
- Code is shared between API and web
- Multiple apps will consume it
- Needs separate versioning
- Forms a cohesive library

### Monorepo Scaling

Phase 1: Current structure (sufficient for MVP)
Phase 2: Consider extracting shared types to `packages/types`
Phase 3: Add microservices or admin panel as separate apps

---

## Environment Files

```
.env.example                        # Template for all env vars
.env.local                          # Local development (gitignored)
.env.staging                        # Staging environment (in CI/CD)
.env.production                     # Production (in CI/CD or secrets manager)
```

### Example .env structure

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/music-folder-dev

# JWT
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=24h

# File Storage
S3_BUCKET=music-folder-local
S3_REGION=us-east-1

# API
API_PORT=3000
API_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

---

## GitIgnore Strategy

Ensure `.gitignore` includes:
```
# Dependencies
node_modules/
package-lock.json (optional - many teams commit this)

# Build output
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Temporary
tmp/
temp/
```

---

## Documentation per Directory

Each major directory should have a `README.md`:

- `apps/api/README.md` - API setup and running instructions
- `apps/web/README.md` - Web setup and running instructions
- `packages/backend/README.md` - Shared package docs
- `openspec/README.md` - How to work with specs and OpenSpec

---

## Directory Growth Checklist

When project grows, check:

- [ ] Are test files organized consistently?
- [ ] Are dependencies clearly separated?
- [ ] Is each module focused on one domain?
- [ ] Can new developers understand the structure quickly?
- [ ] Are repeated utility functions consolidated?
- [ ] Is there an obvious place for new code?

If answer is "no" to any, refactor that area.
