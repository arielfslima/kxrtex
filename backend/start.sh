#!/bin/bash

# KXRTEX Backend - Production Start Script
echo "🚀 Starting KXRTEX Backend..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Start the server
echo "✅ Starting Node server..."
node src/server.js
