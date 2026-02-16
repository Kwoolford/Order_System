.PHONY: help setup seed dev test lint clean install-backend install-frontend

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help:
	@echo "$(BLUE)Greeting Card Shop POS - Available Make Targets$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Installation:$(NC)"
	@echo "  make setup           - Install all dependencies (backend + frontend)"
	@echo "  make install-backend - Install Python dependencies only"
	@echo "  make install-frontend - Install Node dependencies only"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev             - Start backend and frontend dev servers"
	@echo "  make dev-backend     - Start backend dev server only"
	@echo "  make dev-frontend    - Start frontend dev server only"
	@echo ""
	@echo "$(GREEN)Data & Testing:$(NC)"
	@echo "  make seed            - Initialize database with seed data"
	@echo "  make test            - Run all tests (backend + frontend)"
	@echo "  make test-backend    - Run backend tests only"
	@echo "  make test-frontend   - Run frontend tests only"
	@echo ""
	@echo "$(GREEN)Code Quality:$(NC)"
	@echo "  make lint            - Lint and format all code"
	@echo "  make lint-backend    - Lint and format backend code"
	@echo "  make lint-frontend   - Lint and format frontend code"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean           - Clean up generated files and caches"
	@echo "  make clean-backend   - Clean backend artifacts"
	@echo "  make clean-frontend  - Clean frontend artifacts"

# Setup targets
setup: install-backend install-frontend
	@echo "$(GREEN)Setup complete!$(NC)"

install-backend:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && \
	if [ ! -d venv ]; then \
		echo "Creating Python virtual environment..."; \
		python3 -m venv venv; \
	fi; \
	. venv/bin/activate && \
	pip install -q -r requirements.txt && \
	echo "$(GREEN)Backend dependencies installed$(NC)"

install-frontend:
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && \
	npm install --silent && \
	echo "$(GREEN)Frontend dependencies installed$(NC)"

# Development targets
dev:
	@echo "$(BLUE)Starting development environment...$(NC)"
	chmod +x init.sh
	./init.sh

dev-backend:
	@echo "$(BLUE)Starting backend server...$(NC)"
	cd backend && \
	. venv/bin/activate && \
	python main.py

dev-frontend:
	@echo "$(BLUE)Starting frontend server...$(NC)"
	cd frontend && \
	npm run dev

# Seed data
seed:
	@echo "$(BLUE)Seeding database with demo data...$(NC)"
	cd backend && \
	. venv/bin/activate && \
	python -c "from scripts.seed_data import seed; seed()" && \
	echo "$(GREEN)Database seeded successfully$(NC)"

# Testing targets
test: test-backend
	@echo "$(GREEN)All tests completed$(NC)"

test-backend:
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && \
	. venv/bin/activate && \
	pytest -v --cov=app --cov-report=term-missing tests/ && \
	echo "$(GREEN)Backend tests passed$(NC)"

test-frontend:
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend && \
	npm run test && \
	echo "$(GREEN)Frontend tests passed$(NC)"

# Linting and formatting targets
lint: lint-backend lint-frontend
	@echo "$(GREEN)All code formatting complete$(NC)"

lint-backend:
	@echo "$(BLUE)Linting and formatting backend code...$(NC)"
	cd backend && \
	. venv/bin/activate && \
	ruff check --fix app/ && \
	black app/ && \
	echo "$(GREEN)Backend code formatted$(NC)"

lint-frontend:
	@echo "$(BLUE)Linting and formatting frontend code...$(NC)"
	cd frontend && \
	npm run lint && \
	npm run format && \
	echo "$(GREEN)Frontend code formatted$(NC)"

# Cleanup targets
clean: clean-backend clean-frontend
	@echo "$(GREEN)Cleanup complete$(NC)"

clean-backend:
	@echo "$(BLUE)Cleaning backend artifacts...$(NC)"
	cd backend && \
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true; \
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true; \
	find . -type d -name .coverage -exec rm -rf {} + 2>/dev/null || true; \
	rm -rf .mypy_cache .ruff_cache htmlcov/ 2>/dev/null || true; \
	echo "$(GREEN)Backend cleanup complete$(NC)"

clean-frontend:
	@echo "$(BLUE)Cleaning frontend artifacts...$(NC)"
	cd frontend && \
	rm -rf node_modules dist .next out .cache 2>/dev/null || true; \
	echo "$(GREEN)Frontend cleanup complete$(NC)"
