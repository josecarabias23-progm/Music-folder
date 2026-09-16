FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Instalar dependencias del workspace.
# El contexto incluye el package.json de apps/api, cuyas dependencias (bcrypt) se
# compilan con node-gyp: en Alpine hacen falta las herramientas de compilación.
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
 && npm ci \
 && apk del .build-deps

# Copiar el resto del código fuente
COPY . .

# La URL de la API se resuelve en tiempo de build: Vite reemplaza `import.meta.env`
# al generar el bundle. Render la inyecta como variable del servicio y
# docker-compose la pasa vía `build.args` (ver docker-compose.yml).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compilar la aplicación para producción
RUN npm --workspace apps/web run build

EXPOSE 5173

# Render inyecta $PORT (10000 por defecto) y enruta el tráfico a ese puerto; en
# local se conserva 5173. Con el puerto fijo anterior el servicio no respondía.
CMD ["sh", "-c", "npm --workspace apps/web run preview -- --host 0.0.0.0 --port ${PORT:-5173}"]