# Proposal: PWA Support, Installation & Automatic Updates

## Summary
Add Progressive Web App (PWA) support to Music Folder, enabling desktop/mobile installation, offline app caching, Web App Manifest with app icons, and an interactive site update banner/button that notifies users when a new version is available.

## What & Why
- **Problem**: Musicians and conductors need quick offline/app-like access on mobile devices and desktops during rehearsals, without having to open a browser tab every time. Also, when new features or fixes are deployed, users should be informed and able to reload seamlessly to get the latest app build.
- **Solution**: Implement a complete PWA infrastructure with Web App Manifest, PWA SVG/PNG icons, a robust Service Worker (`sw.js`), an "Instalar App" prompt button in the top navigation, and an interactive update toast banner ("Nueva actualización disponible") that triggers `skipWaiting()` and updates the site instantly.

## Goals
1. Provide a Web App Manifest (`manifest.json`) and mobile meta tags in `index.html`.
2. Generate crisp SVG/PNG icons (192x192, 512x512, maskable) in `apps/web/public/icons/`.
3. Create a Service Worker (`sw.js`) with static asset caching and version update management.
4. Implement a `usePWA` hook and install button ("Instalar App") in the UI header when `beforeinstallprompt` fires.
5. Create a dynamic update notification banner that detects waiting service workers and updates the application on click.
