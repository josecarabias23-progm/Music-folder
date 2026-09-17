# 📲 PWA (Progressive Web App) y Soporte Offline

**Music Folder** está equipado con capacidades de **PWA (Progressive Web App)** completas, lo que permite su instalación en teléfonos Android, iOS, tablets y ordenadores de escritorio.

---

## ⚙️ Componentes de la PWA

### 1. Web App Manifest ([`apps/web/public/manifest.json`](file:///home/carabiasjose/Descargas/Music-folder-main/apps/web/public/manifest.json))
Define las características de la aplicación instalable:
- `name`: "Music Folder - Gestión Orquestal"
- `short_name`: "Music Folder"
- `display`: "standalone"
- `start_url`: "/"
- `theme_color`: "#0f172a"
- `background_color`: "#0f172a"
- **Íconos**: Incluye versiones PNG de 192x192, 512x512 y Maskable (`purpose: "any maskable"`).

### 2. Service Worker ([`apps/web/public/sw.js`](file:///home/carabiasjose/Descargas/Music-folder-main/apps/web/public/sw.js))
- **Pre-caché**: Guarda automáticamente recursos estáticos (`index.html`, imágenes, estilos y scripts).
- **Estrategia Stale-While-Revalidate**: Devuelve el recurso desde la caché mientras busca actualizaciones en segundo plano.
- **`SKIP_WAITING`**: Escucha el mensaje de activación para aplicar nuevas versiones sin cerrar la aplicación.

### 3. Hook de PWA ([`apps/web/src/usePWA.ts`](file:///home/carabiasjose/Descargas/Music-folder-main/apps/web/src/usePWA.ts))
- Captura el evento `beforeinstallprompt` para mostrar el botón de **"📲 Instalar App"** en el encabezado.
- Monitorea cuando hay un Service Worker esperando activación para desplegar el cartel flotante **"⚡ ¡Nueva actualización disponible!"**.
- Al hacer clic en "Actualizar sitio", ejecuta la recarga limpia.
