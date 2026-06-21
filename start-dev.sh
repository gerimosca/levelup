#!/bin/bash

# Development server startup script for Vibe Kanban
echo "Starting development server..."

# Ensure we're in the right directory
cd /Users/manulopez/development/saas-boilerplate

# Check if .env.local exists
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local..."
else
  echo "Warning: .env.local not found!"
fi

# Start Next.js dev server
# Next.js will automatically load .env and .env.local files
exec npm run dev