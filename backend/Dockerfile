# ── Stage 1: Build TypeScript ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

# OpenSSL required by Prisma on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm ci

COPY src ./src

RUN npm run build
RUN npx prisma generate

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM node:20-alpine AS runner

# OpenSSL required by Prisma on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# All deps needed (prisma CLI required for migrate deploy)
COPY package*.json ./
RUN npm ci

# Built JS
COPY --from=builder /app/dist ./dist

# Prisma client + schema (needed at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Product images
COPY public ./public

EXPOSE 3001

# Resolve any failed migration record, then apply pending migrations, then start
CMD ["sh", "-c", "npx prisma migrate resolve --rolled-back 20260320200000_add_product_images 2>/dev/null; npx prisma migrate deploy && node dist/app.js"]
