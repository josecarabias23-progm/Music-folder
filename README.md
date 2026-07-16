# Music Folder

Herramienta para músicos y orquestas para subir/descargar partituras, registrar información musical, listar instrumentos y foros de discusión.

Este repositorio está organizado como un monorepo con una sola `node_modules` usando `npm workspaces`, con una API NestJS y un frontend React + TypeScript.

Estructura principal:
- `apps/api` - API backend con NestJS y TypeScript
- `apps/web` - frontend con React + Vite y TypeScript
- `specs/openapi.yaml` - OpenAPI spec inicial
- `.gitignore`

Instrucciones rápidas:

1. Instalar dependencias en el monorepo:

```powershell
npm run bootstrap
```

2. Ejecutar solo la API o la web:

```powershell
npm run start:api
npm run start:web
```

3. Ejecutar ambos en desarrollo:

```powershell
npm run start:dev
```

4. Compilar para producción:

```powershell
npm run build:api
npm run build:web
```

OpenSpec:
- El spec OpenAPI está en `specs/openapi.yaml` para usar con OpenSpec si deseas importar/usar ese spec.
