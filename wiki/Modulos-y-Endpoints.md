# 📡 Módulos de la API y Endpoints REST

La API de **Music Folder** está expuesta bajo el prefijo `/api/v1`. A continuación se detallan los endpoints disponibles por módulo:

---

## 🔐 Autenticación (`/auth`)

- `POST /api/v1/auth/register`: Registro de nuevos usuarios (nombre, correo, contraseña, rol, instrumento).
- `POST /api/v1/auth/login`: Autenticación y devolución de token JWT.
- `GET /api/v1/auth/me`: Obtener datos del usuario actualmente autenticado `@CurrentUser()`.

---

## 🎼 Partituras (`/sheets`)

- `GET /api/v1/sheets`: Listar partituras del catálogo público / general.
- `POST /api/v1/sheets`: Subir / registrar una nueva partitura.
- `GET /api/v1/sheets/:id`: Obtener detalle de una partitura por ID.

---

## 🎺 Agrupaciones Musicales (`/groups`)

- `GET /api/v1/groups`: Listar agrupaciones a las que pertenece el usuario.
- `POST /api/v1/groups`: Crear un nuevo grupo musical (Requiere rol de Director).
- `POST /api/v1/groups/join`: Unirse a un grupo mediante código de invitación.
- `POST /api/v1/groups/:groupId/regenerate-code`: Regenerar código de invitación del grupo.
- `GET /api/v1/groups/:groupId/members`: Listar miembros del grupo.

### Sub-recursos de Grupo (Extraen usuario de Token Bearer)
- `GET /api/v1/groups/:groupId/rehearsals`: Obtenes ensayos programados del grupo.
- `POST /api/v1/groups/:groupId/rehearsals`: Agendar un nuevo ensayo del grupo.
- `GET /api/v1/groups/:groupId/community`: Obtener publicaciones del foro del grupo.
- `POST /api/v1/groups/:groupId/community`: Crear una publicación en el foro del grupo.
- `GET /api/v1/groups/:groupId/library`: Obtener partituras/archivos de la biblioteca del grupo.
- `POST /api/v1/groups/:groupId/library`: Agregar archivo a la biblioteca del grupo.

---

## 🔔 Notificaciones (`/notifications`)

- `GET /api/v1/notifications`: Listar notificaciones del usuario.
- `PATCH /api/v1/notifications/:id/read`: Marcar notificación específica como leída.
- `PATCH /api/v1/notifications/read-all`: Marcar todas las notificaciones como leídas.
