#!/bin/bash

# Mentor Application Startup Script
echo "🚀 Starting Mentor Application..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
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
echo "📦 Starting FastAPI backend on http://localhost:8000..."
cd backend
poetry run uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🎨 Starting Next.js frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are starting up..."
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait