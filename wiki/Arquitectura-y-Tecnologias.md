# 🏗️ Arquitectura y Tecnologías

**Music Folder** se encuentra estructurado como un **Monorepo** moderno que separa la capa de presentación (Frontend Web/PWA) de la capa de servicios y lógica de negocio (Backend REST API).

---

## 🛠️ Stack Tecnológico

### Frontend (`apps/web`)
- **Core**: React 18 + TypeScript + Vite.
- **Estilos**: Vanilla CSS con variables personalizadas + Tailwind CSS.
- **PWA**: Service Worker (`sw.js`), Web App Manifest (`manifest.json`), `usePWA` custom hook.
- **Iconografía**: Lucide React.
- **Cliente HTTP**: Módulo personalizado `api.ts` con manejo de Bearer Token e interceptación de sesiones.

### Backend (`apps/api`)
- **Framework**: NestJS (Node.js + TypeScript).
- **ORM / BD**: TypeORM con soporte para SQLite (`music-folder.sqlite`) en desarrollo y PostgreSQL para producción.
- **Seguridad**: Passwords con `bcrypt` (10 salt rounds), `JwtModule`, `PassportModule` y `@UseGuards(JwtAuthGuard)`.
- **Validación**: `class-validator` y `class-transformer` con `ValidationPipe({ whitelist: true })`.
- **Eventos**: `@nestjs/event-emitter` para disparar eventos internos del dominio (ej: partitura subida, ensayo agendado).

---

## 📂 Estructura del Proyecto

```
Music-folder/
├── apps/
│   ├── api/                     # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/            # Módulo de Autenticación y Usuarios
│   │   │   ├── groups/          # Módulo de Agrupaciones Musicales
│   │   │   ├── sheets/          # Módulo de Partituras
│   │   │   ├── notifications/   # Sistema de Notificaciones
│   │   │   ├── storage/         # Manejo de Almacenamiento de Archivos
│   │   │   └── app.module.ts
│   │   └── db/                  # Base de datos SQLite
│   └── web/                     # Frontend React + Vite
│       ├── public/
│       │   ├── manifest.json    # PWA Web Manifest
│       │   └── sw.js           # Service Worker Cache & Updates
│       └── src/
│           ├── App.tsx          # Dashboard & Componentes UI
│           ├── api.ts           # Cliente API HTTP
│           └── usePWA.ts        # Hook PWA
├── issues/                      # Issues documentadas del proyecto
├── wiki/                        # Documentación Wiki
└── package.json                 # Configuración de NPM Workspaces
```
