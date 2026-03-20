# ── Stage 1: Build React app ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built React files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template (supports env variable substitution)
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

# nginx official image auto-processes /etc/nginx/templates/ with envsubst
CMD ["nginx", "-g", "daemon off;"]
