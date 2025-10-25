#!/bin/bash

# KXRTEX Backend - Build Script
echo "🏗️  Building KXRTEX Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "📊 Generating Prisma Client..."
npx prisma generate

echo "✅ Build complete!"
