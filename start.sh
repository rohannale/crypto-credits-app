#!/bin/bash
echo "Starting Crypto Karma App..."

# Start backend in background
cd backend && npm start &
BACKEND_PID=$!

# Start frontend in background
cd ../frontend && npm start &
FRONTEND_PID=$!

echo "Both servers starting..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID