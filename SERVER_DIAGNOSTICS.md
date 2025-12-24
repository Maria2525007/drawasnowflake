# Инструкция по диагностике проблем на сервере

## Выполните следующие команды на сервере и пришлите вывод

### 1. Проверка PM2 процесса
```bash
cd /var/www/drawasnowflake.online
pm2 list
pm2 logs drawasnowflake-backend --lines 50
pm2 info drawasnowflake-backend
```

### 2. Проверка доступности backend
```bash
curl http://localhost:3001/api/health
curl http://127.0.0.1:3001/api/health
netstat -tlnp | grep 3001
```

### 3. Проверка структуры проекта
```bash
ls -la /var/www/drawasnowflake.online/
ls -la /var/www/drawasnowflake.online/backend/
ls -la /var/www/drawasnowflake.online/backend/dist/
ls -la /var/www/drawasnowflake.online/backend/node_modules/.prisma/client/ 2>/dev/null || echo "Prisma client not found"
```

### 4. Проверка переменных окружения
```bash
cd /var/www/drawasnowflake.online/backend
cat .env 2>/dev/null || echo ".env file not found"
pm2 env drawasnowflake-backend | grep -E "DATABASE_URL|FRONTEND_URL|PORT"
```

### 5. Проверка nginx конфигурации
```bash
nginx -t
find /etc/nginx -name "*drawasnowflake*" -o -name "*drawasnowflake.ru*" 2>/dev/null
cat /etc/nginx/sites-available/drawasnowflake.ru 2>/dev/null || cat /etc/nginx/conf.d/drawasnowflake.conf 2>/dev/null || echo "Nginx config not found in standard locations"
```

### 6. Проверка базы данных
```bash
cd /var/www/drawasnowflake.online/backend
npx prisma db pull --schema=./prisma/schema.prisma 2>&1 | head -20
```

## Что было исправлено в коде

1. **API URL** - изменен с `http://localhost:3001/api` на `/api` (относительный путь)
2. **Nginx proxy** - добавлена конфигурация для проксирования `/api` → `backend:3001`
3. **CORS** - добавлены домены `drawasnowflake.ru` в список разрешенных
4. **Путь в ecosystem.config.js** - исправлен на `/var/www/drawasnowflake.online/backend`
5. **deploy.sh** - добавлены проверки структуры проекта и переменных окружения

## Что нужно сделать на сервере после деплоя

1. **Обновить nginx конфигурацию** - добавить proxy для `/api/` (см. `nginx.conf.example`)
2. **Проверить переменные окружения** - убедиться, что `DATABASE_URL` и `FRONTEND_URL` установлены
3. **Перезапустить nginx** - `systemctl reload nginx` или `nginx -s reload`
4. **Перезапустить PM2** - `pm2 restart drawasnowflake-backend`
