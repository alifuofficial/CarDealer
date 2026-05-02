#!/bin/sh

# Run Prisma migrations
echo "Running database migrations..."
prisma db push --accept-data-loss

# Start the application
echo "Starting the application on port $PORT..."
exec node server.js
