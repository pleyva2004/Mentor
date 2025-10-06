#!/bin/bash

echo "Running E2E Tests for Cursor Prompting Feature"
echo "=============================================="
echo ""

# Function to check if a process is running on a port
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Start backend if not running
if ! check_port 8000; then
    echo "Starting backend server..."
    cd backend
    poetry run uvicorn main:app --port 8000 &
    BACKEND_PID=$!
    cd ..
    sleep 5
else
    echo "Backend already running on port 8000"
fi

# Start frontend if not running
if ! check_port 3000; then
    echo "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    sleep 5
else
    echo "Frontend already running on port 3000"
fi

# Start resume-helper if not running
if ! check_port 3001; then
    echo "Starting resume-helper server..."
    cd resume-helper
    npm run dev -- --port 3001 &
    RESUME_HELPER_PID=$!
    cd ..
    sleep 5
else
    echo "Resume-helper already running on port 3001"
fi

echo ""
echo "Running E2E tests for main frontend..."
echo "--------------------------------------"
cd frontend
npm run test:e2e:ci -- --spec "cypress/e2e/cursor-prompting.cy.ts"
FRONTEND_TEST_RESULT=$?

echo ""
echo "Running E2E tests for resume-helper..."
echo "--------------------------------------"
cd ../resume-helper
npm run test:e2e:ci -- --spec "cypress/e2e/cursor-prompting-resume-helper.cy.ts"
RESUME_HELPER_TEST_RESULT=$?

# Cleanup - kill servers we started
if [ ! -z "$BACKEND_PID" ]; then
    echo "Stopping backend server..."
    kill $BACKEND_PID
fi

if [ ! -z "$FRONTEND_PID" ]; then
    echo "Stopping frontend server..."
    kill $FRONTEND_PID
fi

if [ ! -z "$RESUME_HELPER_PID" ]; then
    echo "Stopping resume-helper server..."
    kill $RESUME_HELPER_PID
fi

echo ""
echo "Test Results:"
echo "-------------"
if [ $FRONTEND_TEST_RESULT -eq 0 ]; then
    echo "✅ Frontend E2E tests: PASSED"
else
    echo "❌ Frontend E2E tests: FAILED"
fi

if [ $RESUME_HELPER_TEST_RESULT -eq 0 ]; then
    echo "✅ Resume-helper E2E tests: PASSED"
else
    echo "❌ Resume-helper E2E tests: FAILED"
fi

# Exit with failure if any tests failed
if [ $FRONTEND_TEST_RESULT -ne 0 ] || [ $RESUME_HELPER_TEST_RESULT -ne 0 ]; then
    exit 1
fi

echo ""
echo "All E2E tests passed! 🎉"
exit 0