#!/bin/bash
set -e

echo "🔄 Загрузка nvm..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Проверка версии Node.js
NODE_VERSION=$(node --version)
echo "📦 Используется Node.js: $NODE_VERSION"

echo "🔄 Обновление кода из Git..."
git fetch origin
git reset --hard origin/fix/deploy

echo "📦 Установка зависимостей frontend..."
cd frontend
export NODE_OPTIONS="--max-old-space-size=4096"
npm install --legacy-peer-deps

echo "🔨 Сборка frontend..."
npm run build

# Проверка, нужен ли backend
if [ -d "../backend" ]; then
    echo "📦 Установка зависимостей backend..."
    cd ../backend
    npm install

    echo "🔨 Сборка backend..."
    npm run build

    echo "🔄 Перезапуск backend..."
    cd ..
    if pm2 list | grep -q "drawasnowflake-backend"; then
        pm2 restart drawasnowflake-backend
    else
        echo "⚠️  Backend не запущен через PM2. Запустите вручную: pm2 start ecosystem.config.js"
    fi
else
    echo "ℹ️  Backend не найден, пропускаем..."
    cd ..
fi

echo "✅ Деплой завершен!"

