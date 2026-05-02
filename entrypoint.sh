#!/bin/sh

# Run Prisma migrations
echo "Running database migrations..."
npx prisma@5.22.0 db push --accept-data-loss

# Start the application
echo "Starting the application..."
node server.js
