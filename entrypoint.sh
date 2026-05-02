#!/bin/sh

# Run Prisma migrations
echo "Running database migrations..."
npx prisma db push --accept-data-loss

# Start the application
echo "Starting the application..."
node server.js
