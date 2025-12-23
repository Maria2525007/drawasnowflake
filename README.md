# DrawASnowflake ❄️

Веб-приложение для создания и анимации снежинок на новогодней ёлке. Аналог [drawafish.app](https://drawafish.app) с поддержкой рисования снежинок, анимации вращения и зуммирования.

## Описание проекта

Приложение позволяет пользователям:
- Рисовать уникальные снежинки с помощью инструментов кисти и ластика
- Анализировать схожесть снежинок с идеальной снежинкой (симметрия, структура)
- Сохранять снежинки в базе данных
- Наблюдать анимацию падающих снежинок на новогодней ёлке с реалистичной физикой
- Использовать приложение на мобильных устройствах

Проект разработан для поддержки 1M DAU (Daily Active Users) с использованием современных веб-технологий и best practices.

## Технологический стек

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev-сервер
- **Material-UI (MUI)** - компоненты интерфейса
- **Redux Toolkit** - управление состоянием
- **React Router** - маршрутизация
- **Framer Motion** - анимации
- **i18n** - интернационализация (русский/английский)

### Backend
- **Node.js** - серверная среда
- **Express** - веб-фреймворк
- **TypeScript** - типизация
- **Prisma** - ORM для работы с БД
- **PostgreSQL** - база данных
- **Helmet** - безопасность HTTP заголовков
- **Express Rate Limit** - ограничение запросов (100 req/15min)
- **Sentry** - мониторинг ошибок

### Web APIs
- **Canvas API** - рисование и анимация снежинок
- **Web Crypto API** - генерация session ID для аналитики

### Тестирование
- **Jest** - unit тесты
- **React Testing Library** - тестирование компонентов
- **Playwright** - E2E тесты
- Покрытие тестами: >= 80%

### Инструменты разработки
- **ESLint** - линтер кода
- **Prettier** - форматирование кода
- **Stylelint** - линтер стилей
- **GitHub Actions** - CI/CD
- **Docker Compose** - контейнеризация

## Архитектура проекта

```
drawasnowflake/
├── backend/                 # Backend приложение
│   ├── src/
│   │   ├── controllers/     # Контроллеры (snowflake, metrics)
│   │   ├── routes/          # API маршруты
│   │   ├── middleware/      # Middleware (analytics, rate limiting)
│   │   ├── utils/           # Утилиты (Sentry, DB health)
│   │   └── server.ts        # Точка входа
│   ├── prisma/
│   │   └── schema.prisma    # Схема базы данных
│   └── Dockerfile
│
├── frontend/                # Frontend приложение
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   │   ├── Canvas/      # Компонент canvas для рисования
│   │   │   ├── Tree/        # Компонент дерева с анимацией
│   │   │   └── UI/          # UI компоненты (Toolbar, Header)
│   │   ├── pages/           # Страницы приложения
│   │   │   ├── DrawPage.tsx # Страница рисования
│   │   │   └── TreePage.tsx # Страница с деревом
│   │   ├── features/        # Redux slices
│   │   │   ├── drawing/     # Состояние рисования
│   │   │   ├── history/     # История действий (undo/redo)
│   │   │   └── snowflake/   # Состояние снежинок
│   │   ├── services/       # API сервисы
│   │   ├── utils/           # Утилиты (анализ снежинок, экспорт)
│   │   ├── store/           # Redux store
│   │   └── i18n/            # Локализация
│   ├── e2e/                 # E2E тесты (Playwright)
│   └── Dockerfile
│
├── docker-compose.yml       # Docker Compose конфигурация
├── Makefile                 # Команды для разработки
└── README.md
```

## Быстрый старт

### Запуск с Docker (рекомендуется)

```bash
docker compose up --build
```

Приложение будет доступно:
- Frontend: http://localhost
- Backend API: http://localhost:3001

### Локальный запуск

```bash
# Установка зависимостей
make install

# Настройка Prisma
make prisma-setup

# Запуск в dev режиме
make dev
```

## Основные возможности

### Рисование снежинок
- Инструменты: кисть и ластик с настраиваемым размером
- Выбор цвета через палитру
- Масштабирование (zoom) с центрированием
- История действий: undo/redo
- Анализ схожести снежинки (симметрия, структура, покрытие)
- Экспорт в PNG и копирование в буфер обмена

### Анимация на дереве
- Падающие снежинки с реалистичной физикой
- Вращение и дрейф снежинок
- Управление скоростью анимации
- Пауза/возобновление
- Загрузка снежинок из базы данных

### Хранение данных
- Сохранение снежинок в PostgreSQL
- Загрузка ранее созданных снежинок
- Обновление и удаление снежинок
- Отслеживание DAU через UserSession

## API Endpoints

```
GET    /api/health              # Health check
GET    /api/snowflakes          # Получить все снежинки
GET    /api/snowflakes/:id      # Получить снежинку по ID
POST   /api/snowflakes          # Создать новую снежинку
PUT    /api/snowflakes/:id      # Обновить снежинку
DELETE /api/snowflakes/:id      # Удалить снежинку
GET    /api/metrics             # Метрики (DAU)
```

## База данных

### Модели

**Snowflake:**
- id, x, y, rotation, scale, pattern
- imageData (Base64)
- fallSpeed, driftSpeed, driftPhase
- createdAt, updatedAt

**UserSession:**
- id, sessionId, userAgent, ipAddress
- date (для группировки по дням)
- createdAt, updatedAt

## Производительность и масштабирование

- **Rate Limiting**: 100 запросов за 15 минут
- **Аналитика**: отслеживание DAU через UserSession
- **Оптимизация Canvas**: использование offscreen canvas для производительности
- **Мобильная адаптивность**: responsive design для всех устройств
- **Мониторинг**: Sentry для отслеживания ошибок

## Тестирование

```bash
# Unit тесты
make test

# E2E тесты
make test-e2e

# С покрытием
cd frontend && npm run test:coverage
cd backend && npm run test:coverage
```

## CI/CD

Проект использует GitHub Actions для:
- Автоматического запуска тестов при PR
- Проверки покрытия тестами (>= 80%)
- Проверки линтеров (ESLint, Prettier, Stylelint)
- Автоматического деплоя при merge в master

## Разработка

### Команды Makefile

```bash
make dev          # Запуск frontend и backend
make install      # Установка зависимостей
make prisma-setup # Настройка Prisma
make build        # Сборка production
make test         # Запуск тестов
make lint         # Проверка линтером
make format       # Форматирование кода
```

### Git Workflow

- `main` - production версия
- `develop` - разработка
- `feature/*` - новые функции
- `fix/*` - исправления багов

Все изменения через Pull Request с обязательным code review.

## Требования курсового проекта

✅ **Клиентская часть:**
- JavaScript/TypeScript
- React фреймворк
- Redux Toolkit state manager
- Vite сборщик
- ESLint, Prettier, Stylelint
- Jest + React Testing Library (unit тесты)
- Playwright (E2E тесты)
- Material-UI компоненты
- Google Analytics аналитика
- Canvas API
- Web Crypto API
- Мобильная адаптивность

✅ **Серверная часть:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Rate limiting
- Sentry мониторинг

✅ **Автоматизация:**
- Docker Compose для развертывания
- GitHub Actions CI/CD
- Автоматический деплой
- Покрытие тестами >= 80%

## Лицензия

[Укажите лицензию проекта]

---

**Приятного рисования снежинок! ❄️**
