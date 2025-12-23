#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

NODE_VERSION=$(node --version)
echo "Using Node.js: $NODE_VERSION"

echo "Updating code from Git..."
git fetch origin
git reset --hard origin/master

echo "Installing frontend dependencies..."
cd frontend
export NODE_OPTIONS="--max-old-space-size=3072"
npm install --legacy-peer-deps --no-audit --no-fund

echo "Building frontend..."
npm run build

if [ -d "../backend" ]; then
    echo "Installing backend dependencies..."
    cd ../backend
    npm install

    echo "Building backend..."
    npm run build

    echo "Restarting backend..."
    cd ..
    if pm2 list | grep -q "drawasnowflake-backend"; then
        pm2 restart drawasnowflake-backend
    else
        echo "Backend not running via PM2. Start manually: pm2 start ecosystem.config.js"
    fi
else
    echo "Backend not found, skipping..."
    cd ..
fi

echo "Deployment completed!"
