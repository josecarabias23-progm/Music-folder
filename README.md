# Music Folder

Herramienta para músicos y orquestas para subir/descargar partituras, registrar información musical, listar instrumentos y foros de discusión.

Este repositorio ahora está organizado como un monorepo con una sola `node_modules` usando `npm workspaces`.

Estructura principal:
- `packages/backend` - backend con NestJS (TypeScript)
- `packages/frontend` - frontend con React + Vite (TypeScript)
- `specs/openapi.yaml` - OpenAPI spec inicial
- `.gitignore`

Instrucciones rápidas:

1. Instalar dependencias en el monorepo:

```powershell
npm run bootstrap
```

2. Ejecutar solo backend o frontend:

```powershell
npm run start:backend
npm run start:frontend
```

3. Ejecutar ambos en desarrollo (concurrently):

```powershell
npm run start:dev
```

OpenSpec:
- El spec OpenAPI está en `specs/openapi.yaml` para usar con OpenSpec si deseas importar/usar ese spec.

¿Quieres que instale dependencias y arranque ambos servicios ahora?