# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests first to leverage layer caching
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

RUN npm ci

# Copy full monorepo (needed for Nx build graph + tsconfig paths)
COPY . .

# Generate Prisma client before building
RUN npx prisma generate

# Build the API (output → apps/api/dist/)
RUN npx nx build api

# ─── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./dist

# Copy node_modules (includes generated Prisma client in .prisma/client)
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema (needed by migrate deploy at runtime)
COPY --from=builder /app/prisma ./prisma

COPY package.json ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
