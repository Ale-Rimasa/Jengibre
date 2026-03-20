# ── Stage 1: Build TypeScript ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

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

WORKDIR /app

# Only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Built JS
COPY --from=builder /app/dist ./dist

# Prisma client + schema (needed at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Product images
COPY public ./public

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
