#!/bin/bash

# Greeting Card POS - Development Environment Initialization Script
# This script starts both the backend and frontend development servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Greeting Card POS - Dev Server Startup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to check if port is in use
check_port() {
    if command -v lsof &> /dev/null; then
        lsof -i :$1 &> /dev/null
        return $?
    else
        netstat -tuln 2>/dev/null | grep ":$1 " &> /dev/null
        return $?
    fi
}

# Check Backend Requirements
echo -e "${YELLOW}Checking backend requirements...${NC}"
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Error: backend/ directory not found${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

# Check if port 8000 is available
if check_port 8000; then
    echo -e "${YELLOW}Port 8000 is already in use. Proceeding anyway...${NC}"
else
    echo -e "${GREEN}Port 8000 is available${NC}"
fi

# Check Frontend Requirements
echo -e "${YELLOW}Checking frontend requirements...${NC}"
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${YELLOW}Warning: frontend/ directory not found${NC}"
fi

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Warning: Node.js is not installed${NC}"
fi

if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
    echo -e "${YELLOW}Warning: Neither npm nor yarn is installed${NC}"
fi

# Check if port 5173 is available
if check_port 5173; then
    echo -e "${YELLOW}Port 5173 is already in use. Proceeding anyway...${NC}"
else
    echo -e "${GREEN}Port 5173 is available${NC}"
fi

echo -e "\n${BLUE}Starting development servers...${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}Servers stopped${NC}"
}

trap cleanup EXIT INT TERM

# Start Backend Server
echo -e "${BLUE}Starting backend server (FastAPI)...${NC}"
cd "$BACKEND_DIR"

if [ -f "requirements.txt" ]; then
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating Python virtual environment...${NC}"
        python3 -m venv venv
    fi

    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

    if ! pip show fastapi &> /dev/null; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        pip install -q -r requirements.txt
    fi
fi

if [ -f "main.py" ]; then
    python3 main.py &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend server started (PID: $BACKEND_PID)${NC}"
    echo -e "${GREEN}API available at: http://localhost:8000${NC}"
    echo -e "${GREEN}API docs at: http://localhost:8000/docs${NC}"
else
    echo -e "${YELLOW}Warning: main.py not found in backend/{{NC}"
fi

sleep 2

# Start Frontend Server
if [ -d "$FRONTEND_DIR" ]; then
    echo -e "\n${BLUE}Starting frontend server (React)...${NC}"
    cd "$FRONTEND_DIR"

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        if command -v yarn &> /dev/null; then
            yarn install --silent
        else
            npm install --silent
        fi
    fi

    if command -v yarn &> /dev/null; then
        yarn dev &
    else
        npm run dev &
    fi
    FRONTEND_PID=$!
    echo -e "${GREEN}Frontend server started (PID: $FRONTEND_PID)${NC}"
    echo -e "${GREEN}Web app available at: http://localhost:5173${NC}"
else
    echo -e "${YELLOW}Frontend directory not found, skipping frontend server${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Development environment is running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Backend API:${NC}  http://localhost:8000"
echo -e "${BLUE}Frontend App:${NC} http://localhost:5173"
echo -e "${BLUE}API Docs:${NC}    http://localhost:8000/docs"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}\n"

# Wait for all background processes
wait
