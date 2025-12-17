.PHONY: run build test clean install dev backend frontend prisma-setup

# Default target - run in development mode
run: dev

# Run in development mode
dev: install
	@echo "Starting frontend and backend locally..."
	@echo "Make sure PostgreSQL is running and DATABASE_URL is set in backend/.env"
	@trap 'kill 0' EXIT; \
	cd backend && npm run dev & \
	cd frontend && npm run dev & \
	wait

# Run backend only
backend:
	cd backend && npm run dev

# Run frontend only
frontend:
	cd frontend && npm run dev

# Install dependencies
install:
	cd frontend && npm install
	cd backend && npm install
	cd backend && npx prisma generate

# Setup Prisma (generate client and run migrations)
prisma-setup:
	cd backend && npx prisma generate
	cd backend && npx prisma migrate dev

# Build production
build:
	cd frontend && npm run build
	cd backend && npm run build

# Run tests
test:
	cd frontend && npm test
	cd backend && npm test

# Run E2E tests
test-e2e:
	cd frontend && npm run test:e2e

# Clean up
clean:
	rm -rf frontend/node_modules backend/node_modules
	rm -rf frontend/dist backend/dist

# Run linters (local)
lint:
	cd frontend && npm run lint
	cd backend && npm run lint

# Format code (local)
format:
	cd frontend && npm run format
	cd backend && npm run format

