FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
ENV PRISMA_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci --ignore-scripts
RUN npx prisma --version || true

COPY prisma ./prisma/
COPY generate-prisma.sh ./generate-prisma.sh
RUN chmod +x ./generate-prisma.sh && ./generate-prisma.sh

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/prisma ./prisma
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && \
    chown nodejs:nodejs /app/docker-entrypoint.sh

USER nodejs

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]