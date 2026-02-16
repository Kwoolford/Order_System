# Greeting Card Shop: Inventory + POS POC

A production-quality Point-of-Sale and Inventory Management system designed for greeting card retailers. This is a comprehensive POC built to impress stakeholders with a polished UI, complete features, and reliable data handling.

## Project Overview

**What This App Does:**
- Fast POS checkout with real-time product search by SKU, name, category, or barcode
- Complete inventory management with stock tracking and adjustments
- Purchase order management with supplier integration
- Sales returns and refunds workflow
- Customer management and order history
- Manager and admin dashboards with charts and reporting
- Audit logging for compliance and accountability

**Who Uses It:**
- **Cashiers** - Fast POS checkout, customer lookup, apply allowed discounts, process returns
- **Managers** - Inventory tools, stock adjustments, purchase orders, reports, tax/payment settings
- **Admins** - User management, audit logs, system maintenance

## Tech Stack

**Backend:**
- Python 3.9+ with FastAPI
- SQLAlchemy ORM
- SQLite for development (PostgreSQL-compatible schema)
- Pytest for testing

**Frontend:**
- React 18+ with TypeScript
- Vite build tool
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API communication

**Tooling:**
- Ruff + Black for Python formatting
- ESLint + Prettier for JavaScript formatting
- Playwright for E2E testing

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### One Command Setup

```bash
# Clone and initialize
git clone https://github.com/Kwoolford/Order_System.git
cd Order_System
make setup
make seed
make dev
```

This runs:
1. Backend API at http://localhost:8000 (with docs at /docs)
2. Frontend at http://localhost:5173

## Default Ports

- **API Server:** 8000 (FastAPI)
- **Frontend:** 5173 (Vite development server)
- **Database:** SQLite (local file, no external setup needed)

## Available Make Targets

```bash
make help              # Show all available targets
make setup             # Install all dependencies
make dev               # Run backend + frontend together
make seed              # Initialize database with demo data
make test              # Run all tests
make lint              # Format all code
make clean             # Clean up generated files
```

Individual targets:
```bash
make dev-backend       # Backend only
make dev-frontend      # Frontend only
make test-backend      # Backend tests only
make test-frontend     # Frontend tests only
make lint-backend      # Format Python code
make lint-frontend     # Format JavaScript code
```

## Demo Credentials

For testing and stakeholder demonstrations:

**Admin Account**
- Email: `admin@greetingcard.local`
- Password: `demo123456`
- Role: Administrator
- Access: Full system control, user management, audit logs

**Manager Account**
- Email: `manager@greetingcard.local`
- Password: `demo123456`
- Role: Store Manager
- Access: Inventory, purchase orders, reports, settings

**Cashier Accounts (3 available)**
- Email: `cashier1@greetingcard.local`
- Password: `demo123456`
- Role: Cashier
- Access: POS, customer lookup, allowed discounts, returns

---

- Email: `cashier2@greetingcard.local`
- Password: `demo123456`

---

- Email: `cashier3@greetingcard.local`
- Password: `demo123456`

## Running the Application

### Automated (Recommended)

```bash
# Start everything with one command
make dev

# In another terminal, seed data (if not already done)
make seed
```

### Manual Start

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

## Key Features Demo

### 1. POS Checkout (The Main Demo)
- Click "/" to focus search box
- Search by product name, SKU, or barcode
- Add items to cart
- Adjust quantities with +/- buttons
- Apply manager discounts (requires manager role)
- Select payment type (Cash, Credit, Split)
- Complete checkout with Ctrl+Enter
- View printable receipt

### 2. Inventory Management
- Browse all products with filtering
- Edit product details (price, cost, reorder thresholds)
- View real-time stock levels
- Record stock adjustments with reason codes
- See products below reorder threshold

### 3. Purchase Orders
- View supplier list
- Create purchase orders from low-stock suggestions
- Receive completed orders (adds stock)
- Track PO status and costs

### 4. Returns & Refunds
- Search orders by receipt/order number
- Return line items individually
- Option to mark items as damaged (not restocked)
- Refund mirrors original payment method
- Complete audit trail recorded

### 5. Reports Dashboard
- Revenue metrics (gross, net, tax collected)
- Top selling products
- Sales by category
- Sales trends (daily, weekly)
- Inventory valuation
- Filters: date range, category, status
- CSV export capability

## API Endpoints

Once running, view full API documentation:
```
http://localhost:8000/docs
```

Key endpoints include:
- `POST /api/auth/login` - User authentication
- `GET /api/products/search` - Fast product search
- `POST /api/orders` - Create order (checkout)
- `GET /api/orders/{id}` - Order details
- `POST /api/returns` - Process return
- `GET /api/inventory/low-stock` - Low stock items
- `POST /api/purchase-orders` - Create PO
- `GET /api/reports/sales` - Sales data for charts
- See Swagger docs for complete API reference

## Project Structure

```
Order_System/
├── backend/
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic
│   │   └── database.py      # Database configuration
│   ├── scripts/
│   │   └── seed_data.py     # Demo data generator
│   ├── tests/               # Pytest tests
│   ├── main.py              # FastAPI app entry point
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API client functions
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
│
├── docs/                    # Documentation
├── init.sh                  # Start script for dev servers
├── Makefile                 # Development commands
├── README.md               # This file
└── app_spec.txt            # Full project specification
```

## Development Workflow

### Making Code Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and test locally:
   ```bash
   make dev      # Run servers in background
   make test     # Run tests
   ```

3. Format code:
   ```bash
   make lint
   ```

4. Commit with descriptive message:
   ```bash
   git add <files>
   git commit -m "feat: Description of changes"
   ```

5. Push and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing

### Backend Tests
```bash
cd backend
source venv/bin/activate
pytest -v tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### E2E Tests
```bash
cd backend
source venv/bin/activate
pytest tests/e2e/test_checkout_flow.py
```

## Database

### Initialization
The database is automatically initialized on first run. It creates:
- All required tables
- Indexes for performance
- Foreign key constraints

### Seed Data
Includes:
- 50-100 realistic greeting card products
- 8 product categories (Birthday, Anniversary, Holiday, Sympathy, Blank, Humor, Kids, Thank You)
- 3 brands/artists
- 30-50 historical orders (last 30 days)
- Several purchase orders (pending and received)
- Sample low-stock items

### Reset Database
```bash
# Remove database file
rm backend/pos_system.db

# Re-initialize
cd backend
source venv/bin/activate
python main.py      # Initializes on startup

# Then seed data
make seed
```

## Performance Targets

- **POS Search:** Instant (< 100ms) with debouncing
- **Page Load:** < 1 second
- **Checkout Complete:** < 2 seconds
- **Reports Generate:** < 3 seconds
- **Search Results:** 50 items in < 200ms

## Security & Compliance

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (RBAC) enforced server-side
- SQL injection prevention with parameterized queries
- Complete audit logging of sensitive actions
- CSRF protection enabled
- Secure session management

## Keyboard Shortcuts (POS)

- `/` - Focus product search
- `Enter` - Add highlighted product to cart
- `+` / `-` - Adjust quantity of selected cart item
- `Ctrl+Enter` - Complete checkout
- `Esc` - Close modals / clear overlays

## Troubleshooting

### Port Already in Use
If ports 8000 or 5173 are already in use:
```bash
# Find and kill process using port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Find and kill process using port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Issues
```bash
# Clear and reinitialize
rm backend/pos_system.db
make seed
```

### Dependency Issues
```bash
# Clean and reinstall
make clean
make setup
make seed
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and lint: `make test && make lint`
4. Commit with clear messages
5. Push and open a PR
6. Code review and merge

## Project Status

This is a production-quality POC. All core features are implemented and tested:
- [x] User authentication and RBAC
- [x] POS checkout flow
- [x] Inventory management
- [x] Purchase orders
- [x] Returns and refunds
- [x] Customer management
- [x] Reports and dashboards
- [x] Audit logging
- [x] Seed data with realistic demo scenarios
- [x] Comprehensive testing

## License

Proprietary - Greeting Card Shop

## Support & Issues

For issues or questions:
1. Check existing issues on GitHub
2. Review API docs at http://localhost:8000/docs
3. Check app_spec.txt for feature details
4. Contact the development team

---

**Built with care for retail excellence.**

Latest updates: February 2026
