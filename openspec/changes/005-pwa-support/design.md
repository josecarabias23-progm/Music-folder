# Technical Design: PWA Support, Installation & Automatic Updates

## Architecture Overview

The PWA system consists of 4 main parts:

1. **Manifest & Meta Tags (`apps/web/public/manifest.json` & `index.html`)**:
   - Web App Manifest defining `name`, `short_name`, `theme_color`, `background_color`, `display: standalone`, and `icons`.
   - Apple iOS & mobile viewport tags (`apple-mobile-web-app-capable`, `theme-color`).

2. **Service Worker Core (`apps/web/public/sw.js`)**:
   - Cache name versioning (`music-folder-v1`).
   - Stale-while-revalidate / cache-first asset management for CSS, JS, HTML, fonts, and icons.
   - Event listener for `message` handling `SKIP_WAITING` command to force activation of new worker.

3. **React PWA Controller Hook (`apps/web/src/usePWA.ts`)**:
   - Registers service worker in browser.
   - Detects `beforeinstallprompt` event and manages `canInstall` state and `promptInstall()` method.
   - Listens for SW update events (`updatefound`, `installed` with `registration.waiting`).
   - Exposes `hasUpdate` boolean and `updateApp()` method (sends `SKIP_WAITING` and reloads window upon `controllerchange`).

4. **UI Integration (`apps/web/src/App.tsx` & `index.css`)**:
   - Top Header button: "Instalar App" (shows when installable).
   - Top Floating Update Toast / Banner: "¡Nueva actualización disponible! Cliquea aquí para actualizar el sitio."
   - Smooth CSS animations for banner and button interactions.
