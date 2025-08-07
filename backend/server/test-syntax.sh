#!/bin/bash

# Quick deployment test script
echo "🔍 Checking for syntax errors in production-server.js..."

# Test syntax without running the server
node -c production-server.js

if [ $? -eq 0 ]; then
    echo "✅ Syntax check passed!"
    echo "🚀 Starting server for quick test..."
    timeout 10s node production-server.js
else
    echo "❌ Syntax errors found!"
    exit 1
fi

echo "🎉 Server test completed!"
