#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 2

echo "Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "Migrations applied successfully"
else
  echo "ERROR: Migration failed. Please check database connection and migration files."
  echo "Database schema may be out of sync. Manual intervention required."
  exit 1
fi

echo "Database is ready"

echo "Starting server..."
exec node dist/server.js