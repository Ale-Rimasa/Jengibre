# ── Stage 1: Build React app ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Build-time args for backend proxy (substituted at build time)
ARG BACKEND_HOST=jengibre_backend
ARG BACKEND_PORT=3001

# Copy built React files
COPY --from=builder /app/dist /usr/share/nginx/html

# Substitute env vars into nginx config at BUILD time → static final config
COPY nginx.conf /tmp/nginx.conf.template
RUN envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /tmp/nginx.conf.template > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
