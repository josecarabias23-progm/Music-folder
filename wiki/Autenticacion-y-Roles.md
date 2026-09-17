# 🔐 Autenticación y Sistema de Roles

El sistema de autenticación de **Music Folder** se basa en **JSON Web Tokens (JWT)** firmados con la cabecera HTTP `Authorization: Bearer <token>`.

---

## 🔑 Flujo de Inicio de Sesión y Registro

1. **Registro (`POST /api/v1/auth/register`)**:
   - Recibe `name`, `email`, `password`, `role` e `instrument_primary`.
   - Si no se especifica rol, se asigna `'Músico / Instrumentista'` por defecto.
   - Si se selecciona `"Director / Conductor"`, se asigna el rol de dirección.
   - Devuelve la entidad pública del usuario y el `token` JWT de acceso.

2. **Login (`POST /api/v1/auth/login`)**:
   - Valida credenciales contra el hash bcrypt guardado en la base de datos.
   - Retorna:
     ```json
     {
       "success": true,
       "user": {
         "id": "usr-123",
         "email": "director@orquesta.org",
         "name": "María González",
         "role": "Director / Conductor",
         "instrument_primary": "Batuta"
       },
       "token": "eyJhbGciOiJIUzI1Ni..."
     }
     ```

3. **Persistencia en el Cliente**:
   - Se guarda el objeto de usuario y el token bajo la clave `music-folder-session` en `localStorage`.
   - Las peticiones subsecuentes inyectan automáticamente `Authorization: Bearer <token>`.

---

## 🎭 Clasificación de Roles y Permisos (`roles.util.ts`)

Los roles en el sistema se almacenan como cadenas descriptivas y se normalizan con `normalizeRole()` para verificar capacidades:

| Rol | Términos coincidentes | Permisos Principales |
| :--- | :--- | :--- |
| **Director / Gestión** | `director`, `conductor`, `gestor`, `coordinador`, `administrador`, `jefe de cuerda` | Crear/Editar grupos musicales, regenerar códigos de invitación, agendar ensayos, subir partituras de grupo. |
| **Músico / Instrumentista** | `músico`, `instrumentista`, `estudiante`, `archivista` | Ver repertorio del grupo, marcar asistencia en ensayos, participar en la comunidad del grupo, ver partituras asignadas. |

```typescript
// roles.util.ts
export function isDirectorRole(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return DIRECTOR_ROLE_TOKENS.some((token) => normalized.includes(token));
}
```
