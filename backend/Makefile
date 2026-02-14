.PHONY: install db seed dev test test-checkout clean help

PYTHON := python3
PIP := $(PYTHON) -m pip
UVICORN := uvicorn
PYTEST := pytest

help:
	@echo "Greeting Card POS Backend - Available Commands"
	@echo "================================================"
	@echo "install       - Install dependencies"
	@echo "db            - Initialize database"
	@echo "seed          - Seed database with sample products"
	@echo "dev           - Run development server"
	@echo "test          - Run tests"
	@echo "test-checkout - Test checkout flow end-to-end"
	@echo "clean         - Clean temporary files and databases"
	@echo "lint          - Run code linting (if black/flake8 installed)"
	@echo "help          - Show this help message"

install:
	@echo "Installing dependencies..."
	$(PIP) install -r requirements.txt
	@echo "Dependencies installed successfully!"

db:
	@echo "Initializing database..."
	$(PYTHON) init_db.py
	@echo "Database initialized!"

seed:
	@echo "Seeding database with sample products..."
	$(PYTHON) seed_products.py
	@echo "Database seeded!"

test-checkout:
	@echo "Testing checkout flow..."
	$(PYTHON) test_checkout.py

dev:
	@echo "Starting development server..."
	@echo "Server will be available at http://localhost:8000"
	@echo "API docs at http://localhost:8000/docs"
	cd /home/agent/ai/projects/ai/pos-poc/backend && $(UVICORN) app.main:app --reload --host 0.0.0.0 --port 8000

test:
	@echo "Running tests..."
	$(PYTEST) tests/ -v

test-coverage:
	@echo "Running tests with coverage..."
	$(PYTEST) tests/ -v --cov=app --cov-report=html --cov-report=term

lint:
	@echo "Running linters..."
	@if command -v black >/dev/null 2>&1; then \
		black --check app/ tests/; \
	else \
		echo "black not installed, skipping..."; \
	fi
	@if command -v flake8 >/dev/null 2>&1; then \
		flake8 app/ tests/; \
	else \
		echo "flake8 not installed, skipping..."; \
	fi

clean:
	@echo "Cleaning temporary files..."
	rm -f data/pos.db
	rm -f test.db
	rm -rf __pycache__
	rm -rf app/__pycache__
	rm -rf tests/__pycache__
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	@echo "Cleanup complete!"
