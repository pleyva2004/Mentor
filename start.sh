#!/bin/bash

# Mentor Application Startup Script
echo "Starting Mentor Application"

# Function to cleanup background processes on exit
cleanup() {
    echo "Stopping servers"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend server
echo "Starting FastAPI backend on http://localhost:8000"
cd backend
# Try poetry first, fallback to virtual environment if poetry not available
if command -v poetry &> /dev/null; then
	# Ensure dependencies are installed for poetry projects
	poetry install --no-root >/dev/null 2>&1 || true
	poetry run uvicorn main:app --reload --port 8000 &
else
	echo "Poetry not found, using virtual environment..."
	if [ -d "venv" ]; then
		source venv/bin/activate
		uvicorn main:app --reload --port 8000 &
	else
		echo "Virtual environment not found. Please run 'python3 -m venv venv' and install dependencies first."
		exit 1
	fi
fi
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "Starting Next.js frontend on http://localhost:3000"
cd frontend

# Install dependencies if missing
if [ ! -d node_modules ]; then
	echo "Installing frontend dependencies..."
	if command -v pnpm &> /dev/null; then
		pnpm install
	elif command -v npm &> /dev/null; then
		npm install
	else
		echo "No package manager found (pnpm or npm). Please install one to continue."
		exit 1
	fi
fi

# Try pnpm first, fallback to npm if pnpm not available
if command -v pnpm &> /dev/null; then
	pnpm run dev &
else
	echo "pnpm not found, using npm..."
	npm run dev &
fi
FRONTEND_PID=$!
cd ..

echo "Both servers are starting up..."
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait