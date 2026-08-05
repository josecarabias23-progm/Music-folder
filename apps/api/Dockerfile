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

# Compilar la aplicación API
RUN npm --workspace apps/api run build

EXPOSE 3001

ENV PORT=3001

CMD ["npm", "--workspace", "apps/api", "run", "start"]
