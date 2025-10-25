#!/bin/bash

# KXRTEX Backend - Production Start Script
echo "🚀 Starting KXRTEX Backend..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Start the server
echo "✅ Starting Node server..."
node src/server.js
