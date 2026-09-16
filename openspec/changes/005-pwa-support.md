# Change #5: PWA Support, Installation & Automatic Updates

## Summary
Implement full Progressive Web App (PWA) capabilities for Music Folder, providing offline caching, Web App Manifest, app icons, a desktop/mobile installation trigger, and an automatic update banner/button that notifies users when a new version is available and updates the site on click.

---

## What & Why

### Problem
Musicians and conductors using Music Folder in rehearsals need immediate app-like access without typing URLs or relying on active web tabs. Furthermore, when new updates or features are deployed to the web app, users need a seamless way to be notified and update their app immediately without stale cache issues.

### Solution
- **Web App Manifest**: Full PWA specification (`manifest.json`) for standalone app execution.
- **Icons & Branding**: Custom SVG/PNG icons for launcher, splash screen, and taskbars.
- **Service Worker (`sw.js`)**: Caching strategies for app assets and background updates.
- **Install App Action**: Capture `beforeinstallprompt` to present an "Instalar App" button in the UI.
- **Update Detection**: Live state monitoring of Service Worker `waiting` status to show a prominent update banner ("Nueva actualización disponible") that triggers instant updates.

---

## Proposed Scope

- `apps/web/public/manifest.json`: PWA Manifest.
- `apps/web/public/icons/`: App icons (192x192, 512x512, maskable 512x512, favicon.svg).
- `apps/web/public/sw.js`: Service worker with skipWaiting support.
- `apps/web/src/usePWA.ts`: React custom hook for PWA state.
- `apps/web/src/App.tsx`: Navigation header install button & update notification bar.
- `apps/web/src/index.css`: Styling for PWA banners, install buttons, and badges.

---

## Success Criteria

- Web App Manifest is valid and recognized by browsers.
- Service Worker installs and registers successfully.
- "Instalar App" button appears when installation prompt is available.
- "Nueva actualización disponible" banner displays when a new service worker is waiting and updates the app upon click.
- Monorepo web build passes cleanly.
