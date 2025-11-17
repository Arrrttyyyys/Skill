#!/bin/bash
# Script to view frontend logs
cd "$(dirname "$0")"

echo "📋 Viewing Skillera Frontend Logs"
echo "=================================="
echo ""
echo "To see real-time logs, run: cd frontend && npm run web"
echo ""
echo "Checking current status..."
echo ""

if lsof -ti:19006 > /dev/null 2>&1; then
  echo "✅ Frontend is running on http://localhost:19006"
  echo ""
  echo "👉 Open in your browser:"
  echo "   http://localhost:19006"
  echo ""
  echo "Press Ctrl+C to stop viewing logs"
  echo ""
  tail -f backend.log 2>/dev/null || echo "No backend logs found"
else
  echo "⚠️  Frontend is not running"
  echo ""
  echo "To start it, run:"
  echo "  cd frontend && npm run web"
fi

