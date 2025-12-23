#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

if [ ! -d "./node_modules/.prisma/client" ]; then
  echo "ERROR: Prisma client directory not found"
  exit 1
fi

echo "SUCCESS: Prisma client generated"