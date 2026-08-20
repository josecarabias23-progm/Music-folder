FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Instalar dependencias del workspace
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación para producción
RUN npm --workspace apps/web run build

EXPOSE 5173

# Servir la versión compilada en modo preview
CMD ["npm", "--workspace", "apps/web", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]