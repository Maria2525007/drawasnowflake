# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client with correct binary target for Alpine
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL 1.1 compatibility library for Prisma
RUN apk add --no-cache libc6-compat && \
    apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/v3.18/main openssl1.1-compat || \
    (apk add --no-cache openssl && \
     mkdir -p /usr/lib && \
     find /usr/lib -name "libssl.so*" -exec ln -sf {} /usr/lib/libssl.so.1.1 \; && \
     find /usr/lib -name "libcrypto.so*" -exec ln -sf {} /usr/lib/libcrypto.so.1.1 \; || true)

# Don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy necessary files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copy entrypoint script (need to do this as root to chmod, then switch to nodejs)
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && \
    chown nodejs:nodejs /app/docker-entrypoint.sh

USER nodejs

EXPOSE 3001

# Use entrypoint script to handle migrations
ENTRYPOINT ["/app/docker-entrypoint.sh"]