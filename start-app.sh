#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Starting Skillera Application..."
echo ""
echo "📦 Starting Backend..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend started (PID: $BACKEND_PID)"
echo "   API: http://localhost:3001"
echo ""

sleep 3

echo "📱 Starting Frontend..."
cd ../frontend
npm run web
