---
name: 'Persistencia Real y Carga de Partituras (PDF / Archivos)'
about: 'Implementación de subida, almacenamiento en disco y respaldo local de partituras'
title: 'fix(partituras): persistencia real y carga de archivos PDF'
labels: 'enhancement, backend, frontend'
assignees: ''
---

## 📌 Resumen del Problema
Actualmente, las partituras (scores) no se están guardando de manera persistente con sus archivos reales ni manteniendo sincronización completa en el cliente/servidor:
1. **Falta de Carga Real de Archivos (Upload)**: Al crear o subir una partitura en el backend ([`SheetsService.create`](file:///home/carabiasjose/Descargas/Music-folder-main/apps/api/src/sheets/sheets.service.ts#L51-L60)), se asigna una URL placeholder estática (`https://example.com/scores/default.pdf`).
2. **Sin persistencia offline / cache local**: Si el servidor no responde o el usuario está offline, la aplicación recurre a `fallbackScores` estáticos en memoria, perdiendo cualquier partitura creada previamente.
3. **Mapeo incompleto de metadatos**: Atributos clave como la URL del archivo PDF (`file_url`), tamaño (`file_size`), tonalidad (`key_signature`) y visibilidad por grupo no quedan reflejados en la interfaz de usuario ni persisten adecuadamente.

---

## 🎯 Tareas y Plan de Acción

- [ ] **Backend: Endpoint multipart para partituras**
  - Añadir soporte para `@UseInterceptors(FileInterceptor('file'))` en `SheetsController.create()`.
  - Integrar `StorageService` para guardar el archivo PDF subido en el directorio de almacenamiento y retornar la URL real (`/uploads/sheets/...`).
  - Actualizar `mapSheetToScoreItem` para incluir `fileUrl`, `fileSize` y `keySignature`.

- [ ] **Frontend: Formulario de subida y cliente API**
  - Agregar `uploadScore(formData: FormData)` en `apps/web/src/api.ts`.
  - Crear/Actualizar el modal de "Nueva Partitura" en `App.tsx` para incluir el input `<input type="file" accept=".pdf" />`.
  - Mostrar la partitura subida en la lista y permitir su descarga o visualización vía iframe / visor PDF.

- [ ] **Persistencia Local (Fallback / Offline)**
  - Guardar partituras obtenidas/creadas en `localStorage` o `IndexedDB` (`music-folder-scores`) como respaldo en caso de desconexión.
