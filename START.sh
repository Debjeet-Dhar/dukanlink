#!/bin/bash

echo "🚀 Starting DukanLink..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Starting development server..."
echo ""
echo "Open your browser at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
