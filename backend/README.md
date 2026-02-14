# Greeting Card POS - Backend API

FastAPI-based backend for the Greeting Card Point of Sale system.

## Features

- FastAPI framework with automatic OpenAPI documentation
- SQLAlchemy ORM with SQLite database
- JWT-based authentication
- Role-based access control (Admin, Manager, Cashier)
- Comprehensive data models for POS operations
- CORS support for frontend integration
- Pytest test suite

## Quick Start

### Prerequisites

- Python 3.10 or higher
- pip package manager

### Installation

```bash
# Install dependencies
make install

# Initialize database with sample data
make db

# Run development server
make dev
```

The server will start at `http://localhost:8000`

API documentation available at `http://localhost:8000/docs`

## Sample Users

After running `make db`, the following test users are available:

| Email | Password | Role |
|-------|----------|------|
| admin@pos.com | admin123 | admin |
| manager@pos.com | manager123 | manager |
| cashier@pos.com | cashier123 | cashier |

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get access token
- `GET /auth/me` - Get current user info (requires auth)

### Health

- `GET /health` - Health check endpoint
- `GET /` - API information

## Database Models

### Core Models

- **User** - System users with role-based access
- **Product** - Greeting card products with inventory
- **Order** - Sales transactions
- **OrderItem** - Individual items in orders
- **InventoryMovement** - Inventory change tracking
- **Supplier** - Product suppliers
- **PurchaseOrder** - Purchase orders to suppliers
- **PurchaseOrderItem** - Items in purchase orders
- **AuditLog** - System audit trail

## Development

### Running Tests

```bash
make test
```

### Database Management

```bash
# Reinitialize database (WARNING: deletes all data)
make clean
make db
```

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── config.py         # Configuration
│   ├── database.py       # Database setup
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── auth.py           # Authentication utilities
│   └── routes/
│       ├── __init__.py
│       └── auth.py       # Auth endpoints
├── tests/
│   ├── __init__.py
│   ├── conftest.py       # Test fixtures
│   ├── test_main.py
│   └── test_auth.py
├── data/
│   └── pos.db            # SQLite database (created on init)
├── init_db.py            # Database initialization script
├── requirements.txt      # Python dependencies
├── pyproject.toml        # Poetry configuration
├── Makefile             # Build commands
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Application
APP_NAME="Greeting Card POS"
DEBUG=True

# Database
DATABASE_URL=sqlite:///./data/pos.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## License

MIT
