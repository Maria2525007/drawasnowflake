#!/bin/sh
set -e

MAX_ATTEMPTS=5
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "=== Prisma generate attempt $ATTEMPT/$MAX_ATTEMPTS ==="
  if npx prisma generate --schema=./prisma/schema.prisma; then
    echo "SUCCESS: Prisma client generated successfully"
    break
  else
    EXIT_CODE=$?
    echo "FAILED: Attempt $ATTEMPT failed with exit code $EXIT_CODE"
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
      echo "ERROR: All $MAX_ATTEMPTS attempts failed. Last exit code: $EXIT_CODE"
      exit 1
    fi
    WAIT_TIME=$((ATTEMPT * 3))
    echo "Waiting ${WAIT_TIME}s before retry..."
    sleep $WAIT_TIME
    ATTEMPT=$((ATTEMPT + 1))
  fi
done

if [ ! -d "./node_modules/.prisma/client" ]; then
  echo "ERROR: Prisma client directory not found after generation"
  exit 1
fi

echo "SUCCESS: Prisma client verification passed"
