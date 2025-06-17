#!/bin/bash

# Start the Real-Time Event Check-In App

echo "🚀 Starting Real-Time Event Check-In App"
echo "========================================="

# Get the local IP address
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
echo "📍 Detected IP address: $LOCAL_IP"

# Update the frontend configuration files to use the correct IP
echo "🔧 Updating frontend configuration..."

# Update App.tsx
sed -i '' "s/http:\/\/localhost:4000\/graphql/http:\/\/$LOCAL_IP:4000\/graphql/g" frontend/App.tsx

# Update EventListScreen.tsx
sed -i '' "s/http:\/\/localhost:4000\/graphql/http:\/\/$LOCAL_IP:4000\/graphql/g" frontend/src/screens/EventListScreen.tsx
sed -i '' "s/http:\/\/localhost:4000'/http:\/\/$LOCAL_IP:4000'/g" frontend/src/screens/EventListScreen.tsx

# Update EventDetailScreen.tsx
sed -i '' "s/http:\/\/localhost:4000\/graphql/http:\/\/$LOCAL_IP:4000\/graphql/g" frontend/src/screens/EventDetailScreen.tsx
sed -i '' "s/http:\/\/localhost:4000'/http:\/\/$LOCAL_IP:4000'/g" frontend/src/screens/EventDetailScreen.tsx

echo "✅ Configuration updated to use IP: $LOCAL_IP"

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Test backend connection
if curl -s http://localhost:4000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:4000"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🔧 Starting frontend..."
cd ../frontend
npx expo start --tunnel

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Servers stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM