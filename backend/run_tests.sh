#!/bin/bash

# Run backend tests for cursor prompting feature

echo "Running Cursor Prompting Tests..."
echo "================================"

# Install test dependencies if needed
echo "Installing test dependencies..."
poetry install --with dev

echo ""
echo "Running unit tests..."
echo "--------------------"
poetry run pytest test_prompting.py -v

echo ""
echo "Running integration tests..."
echo "---------------------------"
poetry run pytest test_api_integration.py -v

echo ""
echo "Running all tests with coverage..."
echo "---------------------------------"
poetry run pytest test_prompting.py test_api_integration.py -v --cov=prompting --cov=cursor_prompts --cov-report=term-missing

echo ""
echo "Tests completed!"