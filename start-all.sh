#!/bin/bash

# Create a logs directory if it doesn't exist
mkdir -p logs

echo "Starting PocketBase server..."
(cd backend && ./pocketbase serve) > logs/pocketbase.log 2>&1 &
POCKETBASE_PID=$!


echo "Starting frontend development server..."
(cd frontend && npm run dev) > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "All services started."
echo "Logs are being written to the 'logs' directory."
echo "PocketBase PID: $POCKETBASE_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "To view logs, run:"
echo "tail -f logs/pocketbase.log"
echo "tail -f logs/frontend.log"

# Wait for any process to exit
wait -n

# Kill all background processes on exit
echo "Stopping all services..."
kill $POCKETBASE_PID  $FRONTEND_PID
