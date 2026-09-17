# Issue #001: Persistencia Real y Carga de Partituras (PDF / Archivos)

**Estado**: `Abierto`  
**Prioridad**: `Alta`  
**Etiquetas**: `backend`, `frontend`, `storage`, `partituras`  

---

## 📌 Resumen del Problema
Actualmente, las partituras (scores / partituras musicales) no se están guardando de manera persistente con sus archivos reales ni manteniendo sincronización completa en el cliente/servidor:
1. **Falta de Carga Real de Archivos (Upload)**: Al crear o subir una partitura en el backend ([`SheetsService.create`](file:///home/carabiasjose/Descargas/Music-folder-main/apps/api/src/sheets/sheets.service.ts#L51-L60)), se asigna una URL placeholder estática (`https://example.com/scores/default.pdf`).
2. **Sin persistencia offline / cache local**: Si el servidor no responde o el usuario está offline, la aplicación recurre a `fallbackScores` estáticos en memoria, perdiendo cualquier partitura creada previamente.
3. **Mapeo incompleto de metadatos**: Atributos clave como la URL del archivo PDF (`file_url`), tamaño (`file_size`), tonalidad (`key_signature`) y visibilidad por grupo no quedan reflejados en la interfaz de usuario ni persisten adecuadamente.

---

## 🔍 Análisis Técnico y Causa Raíz

### 1. Backend (`apps/api/src/sheets/`)
- **`sheets.service.ts`**: El método `create()` no procesa multipart/form-data ni utiliza `StorageService` para almacenar el PDF en disco/S3, sino que graba una URL hardcodeada.
- **`sheets.controller.ts`**: Falta el endpoint de carga con `@UseInterceptors(FileInterceptor('file'))` para procesar archivos binarios PDF o MusicXML.

### 2. Frontend (`apps/web/src`)
- **`api.ts`**: `getScores()` retorna `fallbackScores` hardcodeados ante fallos. Falta implementar `createScore()` o `uploadScore()` con `FormData` en `api.ts`.
- **Modales de Carga en UI**: No hay un selector de archivo `<input type="file" accept=".pdf,.xml,.mscz" />` integrado con indicador de progreso de subida ni visor PDF para partituras persistidas.

---

## 🎯 Tareas y Plan de Acción Propiamente Dicho

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

---

## 🛠️ Criterios de Aceptación
1. Un usuario (Director o Músico) puede subir un archivo PDF real como partitura.
2. La partitura guardada persiste en la base de datos y en el sistema de almacenamiento.
3. Al recargar la página o ingresar nuevamente, la partitura subida aparece en la biblioteca con su enlace/vista previa funcional.
