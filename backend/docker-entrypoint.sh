#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 2

echo "Running Prisma migrations..."
if npx prisma migrate deploy 2>/dev/null; then
  echo "Migrations applied successfully"
else
  echo "No migrations found or migrate failed, trying db push as fallback..."
  npx prisma db push --accept-data-loss || echo "Database schema sync failed, continuing anyway..."
fi

echo "Starting server..."
exec node dist/server.js