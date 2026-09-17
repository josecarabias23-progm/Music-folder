# 🚀 Guía de Instalación y Desarrollo Local

Esta guía detalla los pasos para levantar el entorno de desarrollo completo de **Music Folder** en tu máquina local.

---

## 📋 Requisitos Previos

- **Node.js**: Versión 18 LTS o superior.
- **NPM**: Versión 9+ (incluido con Node.js).
- **Git**.

---

## 🛠️ Pasos de Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/josecarabias23-progm/Music-folder.git
cd Music-folder
```

### 2. Instalar Dependencias del Monorepo
El proyecto utiliza NPM Workspaces para gestionar las dependencias de `apps/api` y `apps/web` desde la raíz:

```bash
npm install
```

### 3. Configurar Variables de Entorno

#### Backend (`apps/api/.env`)
Crea un archivo `.env` en `apps/api/` con la siguiente configuración base:

```env
API_PORT=3000
DATABASE_URL=sqlite:db/music-folder.sqlite
JWT_SECRET=desarrollo-secret-key-music-folder-2026
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (`apps/web/.env`)
Crea un archivo `.env` en `apps/web/`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 💻 Comandos de Ejecución

| Acción | Comando (desde la raíz) |
| :--- | :--- |
| **Iniciar todo en desarrollo** | `npm run start:dev` |
| **Iniciar solo el Backend (NestJS)** | `npm run start:api` |
| **Iniciar solo el Frontend (Vite)** | `npm run start:web` |
| **Compilar Backend para producción** | `npm run build -w apps/api` |
| **Compilar Frontend para producción** | `npm run build -w apps/web` |
