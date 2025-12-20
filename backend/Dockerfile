# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install OpenSSL for Prisma (required for Prisma client generation)
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies first (without Prisma generation)
RUN npm ci --ignore-scripts

# Copy Prisma schema and generate client with correct binary targets
COPY prisma ./prisma/
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

# Install OpenSSL and required libraries for Prisma (OpenSSL 3.0.x for linux-musl)
RUN apk add --no-cache openssl libc6-compat

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