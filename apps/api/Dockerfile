FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Instalar dependencias del workspace.
# `bcrypt` es un módulo nativo: en Alpine (musl) no hay binarios precompilados, por
# lo que node-gyp necesita la cadena de compilación (se elimina al terminar).
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
 && npm ci \
 && apk del .build-deps

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación API
RUN npm --workspace apps/api run build

EXPOSE 3001

ENV PORT=3001

CMD ["npm", "--workspace", "apps/api", "run", "start"]
