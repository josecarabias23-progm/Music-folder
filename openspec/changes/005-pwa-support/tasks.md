# Tasks: PWA Support, Installation & Automatic Updates

## Phase 1: Web App Manifest & App Icons
- [x] Create `apps/web/public/manifest.json` with app metadata, standalone mode, and icon definitions.
- [x] Create `apps/web/public/favicon.svg` and high-resolution PWA icons (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `icon.svg`) matching Stitch UI aesthetics.
- [x] Update `apps/web/index.html` with manifest links, theme colors, and iOS web app meta tags.

## Phase 2: Service Worker Core (`sw.js`)
- [x] Implement `apps/web/public/sw.js` with versioned cache strategy.
- [x] Implement `message` listener in `sw.js` for `SKIP_WAITING` command.
- [x] Configure cache cleanup on service worker `activate` event.

## Phase 3: React PWA Controller Hook (`usePWA.ts`)
- [x] Create `apps/web/src/usePWA.ts` hook for SW registration, update detection, and installation prompt handling.
- [x] Handle `beforeinstallprompt` and `appinstalled` events.
- [x] Handle `registration.waiting` state and `controllerchange` window reload logic.

## Phase 4: UI Integration (Install Button & Update Banner)
- [x] Add "Instalar App" action button in `App.tsx` top navigation header.
- [x] Add floating Update Toast Banner ("Nueva actualización disponible") in `App.tsx` when `hasUpdate` is true.
- [x] Add smooth CSS animations and styling in `apps/web/src/index.css`.

## Phase 5: Verification & Monorepo Build
- [x] Verify Vite build (`npm run build -w apps/web`).
- [x] Verify PWA manifest, service worker registration, and app installation UI readiness.
