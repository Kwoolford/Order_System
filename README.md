# Greeting Card POS Application

A modern Point-of-Sale system designed specifically for greeting card retailers, featuring inventory management, sales tracking, and customer relationship management.

## Project Overview

This is a full-stack web application built with:
- **Backend:** FastAPI (Python) - REST API and business logic
- **Frontend:** React with TypeScript - Interactive user interface
- **Database:** PostgreSQL - Data persistence
- **Real-time:** WebSockets for live order updates

## Quick Setup

### Prerequisites
- Python 3.9+
- Node.js 16+ and npm/yarn
- PostgreSQL 12+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kwoolford/Order_System.git
   cd Order_System
   ```

2. Run initialization script:
   ```bash
   chmod +x init.sh
   ./init.sh
   ```

Or manually:

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

## Demo Credentials

For stakeholder demos and testing:

**Admin Account:**
- Email: demo@greetingcardpos.local
- Password: demo123456
- Role: Administrator

**Sales Associate Account:**
- Email: sales@greetingcardpos.local
- Password: sales123456
- Role: Sales Associate

**Manager Account:**
- Email: manager@greetingcardpos.local
- Password: manager123456
- Role: Store Manager

## Running the Application

### Start Dev Servers

Use the provided initialization script:
```bash
./init.sh
```

This will:
- Start the FastAPI backend server (Port 8000)
- Start the React frontend dev server (Port 5173)
- Display health status of both servers

### Manual Start

**Backend (API Server):**
```bash
cd backend
source venv/bin/activate
python main.py
# Runs on: http://localhost:8000
# API docs: http://localhost:8000/docs
```

**Frontend (Web Application):**
```bash
cd frontend
npm run dev
# Runs on: http://localhost:5173
```

## Port Information

- **API Server:** `8000` - FastAPI REST API with Swagger documentation
- **Web Application:** `5173` - React development server
- **Database:** `5432` - PostgreSQL (local)

## Tech Stack

### Backend
- FastAPI - Modern, fast web framework
- SQLAlchemy - ORM for database operations
- Pydantic - Data validation
- Uvicorn - ASGI server
- PostgreSQL - Primary database

### Frontend
- React 18+ - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Axios - HTTP client
- Zustand - State management

### Infrastructure
- Docker - Containerization (optional)
- Docker Compose - Multi-container orchestration

## Project Structure

```
.
├── backend/              # FastAPI application
│   ├── app/
│   ├── models/
│   ├── schemas/
│   ├── api/
│   ├── database.py
│   └── main.py
├── frontend/             # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docs/                 # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── FEATURES.md
├── init.sh              # Initialization script
└── README.md            # This file
```

## Features

- Real-time inventory management
- Point-of-sale transactions
- Customer management and CRM
- Sales analytics and reporting
- User authentication and role-based access
- Receipt printing and digital receipts
- Multi-location support

## API Documentation

Once the backend is running, visit:
```
http://localhost:8000/docs
```

This provides interactive API documentation with the ability to test endpoints.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "feat: Description of changes"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues or questions, please contact the development team.
