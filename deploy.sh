#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

NODE_VERSION=$(node --version)
echo "Using Node.js: $NODE_VERSION"

echo "Updating code from Git..."
git fetch origin
git reset --hard origin/master

echo "Checking project structure..."
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  echo "ERROR: backend or frontend directory not found"
  exit 1
fi

echo "Installing frontend dependencies..."
cd frontend
export NODE_OPTIONS="--max-old-space-size=3072"
npm install --legacy-peer-deps --no-audit --no-fund

echo "Building frontend..."
npm run build

if [ -d "../backend" ]; then
    echo "Installing backend dependencies..."
    cd ../backend
    
    echo "Cleaning old Prisma client and node_modules cache..."
    rm -rf node_modules/.prisma
    rm -rf node_modules/@prisma/client
    
    echo "Installing dependencies..."
    npm install

    echo "Generating Prisma client..."
    npx prisma generate --schema=./prisma/schema.prisma
    if [ ! -d "./node_modules/.prisma/client" ]; then
      echo "ERROR: Prisma client directory not found after generation"
      exit 1
    fi
    echo "Prisma client generated successfully"
    
    echo "Verifying Prisma client has UserSession model..."
    if ! grep -q "userSession" node_modules/.prisma/client/index.d.ts 2>/dev/null; then
      echo "WARNING: UserSession model not found in Prisma client, but continuing..."
    fi

    echo "Building backend..."
    npm run build

    echo "Checking environment variables..."
    if [ -z "$DATABASE_URL" ] && [ ! -f ".env" ]; then
      echo "WARNING: DATABASE_URL not set and .env file not found"
      echo "Backend may not work without database connection"
    fi

    echo "Restarting backend..."
    cd ..
    if pm2 list | grep -q "drawasnowflake-backend"; then
        pm2 restart drawasnowflake-backend
        echo "Backend restarted via PM2"
    else
        echo "Backend not running via PM2. Starting..."
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    echo "PM2 status:"
    pm2 list
else
    echo "Backend not found, skipping..."
    cd ..
fi

echo "Deployment completed!"
