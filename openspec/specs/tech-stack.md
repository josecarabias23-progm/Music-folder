# Tech Stack - Music Folder

## Overview
Decisiones tecnológicas y dependencias para Music Folder (proyecto OpenSpec).

---

## Backend Stack (NestJS)

### Core Framework
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ LTS | JavaScript runtime |
| NestJS | 10.x | Backend framework |
| TypeScript | 5.x | Type safety |
| Express | 4.x | HTTP server (NestJS built on top) |

### Database & ORM
| Tool | Version | Purpose |
|------|---------|---------|
| PostgreSQL | 14+ | Primary database (production) |
| TypeORM | 0.3.x | Object-Relational Mapper |
| @nestjs/typeorm | 10.x | NestJS TypeORM integration |
| pg | 8.x | PostgreSQL driver |

### Authentication & Security
| Tool | Version | Purpose |
|------|---------|---------|
| @nestjs/jwt | 11.x | JWT token handling |
| @nestjs/passport | 10.x | Passport.js integration |
| passport-jwt | 4.x | JWT strategy |
| bcryptjs | 2.4.x | Password hashing |
| @nestjs/security | 10.x | Security best practices |

### Validation & Serialization
| Tool | Version | Purpose |
|------|---------|---------|
| class-validator | 0.14.x | DTO validation decorators |
| class-transformer | 0.5.x | Object transformation |
| @nestjs/common | 10.x | Common pipes/decorators |

### File Handling
| Tool | Version | Purpose |
|------|---------|---------|
| @nestjs/common | 10.x | MultipartFile handling |
| multer | 1.4.x | File upload middleware |
| aws-sdk | 2.x | AWS S3 integration (optional) |
| sharp | 0.32.x | Image optimization |

### API Documentation
| Tool | Version | Purpose |
|------|---------|---------|
| @nestjs/swagger | 7.x | Swagger/OpenAPI docs |
| swagger-ui-express | 5.x | Swagger UI frontend |

### Logging & Monitoring
| Tool | Version | Purpose |
|------|---------|---------|
| winston | 3.x | Structured logging |
| nest-winston | 1.x | Winston integration for NestJS |
| @sentry/node | 7.x | Error tracking (optional) |

### Environment & Configuration
| Tool | Version | Purpose |
|------|---------|---------|
| @nestjs/config | 3.x | Environment variable management |
| dotenv | 16.x | Load .env files |
| joi | 17.x | Environment validation schema |

### Testing
| Tool | Version | Purpose |
|------|---------|---------|
| jest | 29.x | Testing framework |
| @types/jest | 29.x | Jest TypeScript types |
| ts-jest | 29.x | TypeScript support in Jest |
| supertest | 6.x | HTTP assertion library |

### Utilities
| Tool | Version | Purpose |
|------|---------|---------|
| uuid | 9.x | UUID generation |
| date-fns | 2.x | Date manipulation |
| lodash | 4.x | Utility functions |

### Development Dependencies
| Tool | Version | Purpose |
|------|---------|---------|
| @types/node | 18.x | Node.js TypeScript definitions |
| @types/express | 4.x | Express TypeScript definitions |
| eslint | 8.x | Code linting |
| prettier | 3.x | Code formatting |
| ts-loader | 9.x | TypeScript webpack loader |

---

## Frontend Stack (React + Vite)

### Core Framework
| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool (faster than CRA) |
| Vitals | Latest | Core Web Vitals integration |

### Styling
| Tool | Version | Purpose |
|------|---------|---------|
| Tailwind CSS | 3.x | Utility-first CSS framework |
| PostCSS | 8.x | CSS transformation |
| autoprefixer | 10.x | Vendor prefixes |

### State Management
| Tool | Version | Purpose |
|------|---------|---------|
| Zustand | 4.x | Lightweight state management |
| OR React Redux | 8.x | Alternative (if complexity warranted) |

### HTTP Client
| Tool | Version | Purpose |
|------|---------|---------|
| axios | 1.x | HTTP client library |
| react-query (TanStack Query) | 5.x | Server state management |

### Forms & Validation
| Tool | Version | Purpose |
|------|---------|---------|
| react-hook-form | 7.x | Form state management |
| zod | 3.x | Schema validation |

### Routing
| Tool | Version | Purpose |
|------|---------|---------|
| react-router-dom | 6.x | Client-side routing |

### UI Components
| Tool | Version | Purpose |
|------|---------|---------|
| shadcn/ui | Latest | Headless component library |
| @radix-ui/primitives | Latest | Unstyled accessible components |
| Lucide React | Latest | Icon library |

### File Upload
| Tool | Version | Purpose |
|------|---------|---------|
| react-dropzone | 14.x | Drag-and-drop file upload |

### Rich Text Editor
| Tool | Version | Purpose |
|------|---------|---------|
| react-markdown | 9.x | Markdown rendering |
| @uiw/react-markdown-editor | Latest | Markdown editor (optional) |

### Date & Time
| Tool | Version | Purpose |
|------|---------|---------|
| date-fns | 2.x | Date manipulation |
| react-calendar | 4.x | Calendar component (optional) |

### Testing
| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | Latest | Unit testing (faster Jest alternative) |
| @testing-library/react | 14.x | Component testing utilities |
| @testing-library/jest-dom | 6.x | Custom Jest matchers |
| @testing-library/user-event | 14.x | User interaction simulation |
| Playwright | Latest | E2E testing |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| @types/react | 18.x | React TypeScript definitions |
| @types/react-dom | 18.x | React DOM TypeScript definitions |
| @vitejs/plugin-react | Latest | React Fast Refresh for Vite |
| eslint | 8.x | Code linting |
| eslint-plugin-react | 7.x | React-specific linting rules |
| prettier | 3.x | Code formatting |

### Performance & Analytics
| Tool | Version | Purpose |
|------|---------|---------|
| web-vitals | Latest | Core Web Vitals measurement |
| @sentry/react | 7.x | Error tracking (optional) |

### Utilities
| Tool | Version | Purpose |
|------|---------|---------|
| clsx | 2.x | Class name conditionals |
| classnames | 2.x | Alternative to clsx |

---

## DevOps & Infrastructure

### Docker & Containerization
```yaml
Services:
  - api (NestJS container)
  - web (React+Nginx static container)
  - postgres (Database container)
  - redis (Cache container, optional)
```

### Version Control
| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Repository hosting |

### CI/CD Pipeline
| Tool | Purpose |
|------|---------|
| GitHub Actions | Automated testing & deployment |
| Jest/Vitest | Automated testing |
| ESLint | Code quality checks |
| Prettier | Code formatting checks |

### Deployment Options

#### Option 1: Vercel + Render (Recommended for MVP)
```
Frontend: Vercel (React+Vite deployment)
Backend: Render.com (NestJS deployment)
Database: Render PostgreSQL
```

#### Option 2: Docker Compose + VPS
```
Host: DigitalOcean/AWS/Linode/Hetzner
Container Orchestration: Docker Compose
Reverse Proxy: Nginx
SSL: Let's Encrypt
```

#### Option 3: Full Managed Services
```
Frontend: AWS S3 + CloudFront
Backend: AWS Lambda + API Gateway (Serverless)
       OR AWS ECS (Containerized)
Database: AWS RDS (PostgreSQL)
Storage: AWS S3
```

### Monitoring & Observability
| Tool | Purpose |
|------|---------|
| Sentry | Error tracking & alerting |
| LogRocket | Frontend session replay (optional) |
| Prometheus + Grafana | Metrics & dashboards (optional) |

---

## Package Manager & Build

### Package Management
| Tool | Purpose |
|------|---------|
| npm 9+ | Package manager (monorepo support) |
| npm workspaces | Monorepo management |

### Monorepo Structure
```
root package.json:
  - workspaces: ["apps/api", "apps/web", "packages/*"]
  - scripts: bootstrap, build, start, start:dev

Dependencies shared at root level:
  - TypeScript, ESLint, Prettier (shared tooling)
```

### Scripts Configuration
```json
{
  "scripts": {
    "bootstrap": "npm install && npm run build:packages",
    "build:packages": "npm run build -w packages/backend",
    "build": "npm run build -w apps/api && npm run build -w apps/web",
    "start:api": "npm run start -w apps/api",
    "start:web": "npm run dev -w apps/web",
    "start:dev": "npm run start:api & npm run start:web",
    "test": "npm run test -w apps/api && npm run test -w apps/web",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Environment Configuration

### Development (.env.local)
```env
# API
API_PORT=3000
API_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/music_folder_dev
JWT_SECRET=dev-secret-key-not-for-production

# Frontend
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

### Production (.env.production)
```env
# API
API_PORT=3000
API_ENV=production
DATABASE_URL=postgresql://...@prod-db:5432/music_folder_prod
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://musicfolder.app

# Storage
S3_BUCKET=music-folder-prod
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>

# Frontend
VITE_API_URL=https://api.musicfolder.app
VITE_ENV=production
VITE_SENTRY_DSN=<sentry-dsn>
```

---

## Dependency Management Strategy

### Regular Updates
- Monthly security updates
- Quarterly minor version updates
- Annual major version reviews

### Lock Files
- `package-lock.json` committed to repository
- Ensures reproducible builds
- Prevents dependency conflicts in CI/CD

### Dependency Audit
```bash
npm audit                          # Check for vulnerabilities
npm audit fix                      # Automatically fix issues
npm outdated                       # See available updates
```

---

## Browser Support

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

### Polyfills
- None required for modern browsers
- Optional: AbortController polyfill for older environments

---

## Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Backend
- API Response Time: < 200ms (p95)
- Database Query Time: < 100ms (p95)
- Uptime: 99.9%

---

## License & Legal

### Project License
- MIT License (recommended for open-source consideration)

### Dependency Licenses
- All dependencies must have permissive licenses (MIT, Apache 2.0, BSD)
- Regular license compliance audits recommended

---

## Migration Path (Future Phases)

### Phase 2: Enhancements
- Add microservices (Kafka/RabbitMQ)
- Implement ElasticSearch for forum search
- Redis caching layer for instruments

### Phase 3: Scale
- Kubernetes orchestration
- GraphQL API (Apollo Server)
- Real-time features (Socket.io/WebSockets)
- Mobile app (React Native)
