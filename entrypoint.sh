#!/bin/sh

# Run Prisma migrations
echo "DEBUG: Current user: $(whoami)"
echo "DEBUG: DATABASE_URL is: $DATABASE_URL"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set! Using temporary local database."
  export DATABASE_URL="file:/data/sqlite.db"
fi

echo "Running database synchronization..."
prisma db push --accept-data-loss || echo "WARNING: Database sync failed, attempting to start app anyway..."

echo "Seeding initial data..."
prisma db seed || echo "WARNING: Seeding failed, continuing anyway..."

# Start the application
echo "Starting the application on port ${PORT:-3000}..."
exec node server.js
