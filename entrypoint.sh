#!/bin/sh

# Run Prisma migrations
echo "DEBUG: Current user: $(whoami)"
echo "DEBUG: DATABASE_URL is: $DATABASE_URL"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set! Using temporary local database."
  export DATABASE_URL="file:/data/sqlite.db"
fi

echo "Running database synchronization..."
prisma db push --accept-data-loss --skip-generate || echo "WARNING: Database sync failed, attempting to start app anyway..."

echo "Seeding initial data..."
# Use node to run the compiled seed.js instead of npx prisma db seed (which uses ts-node)
node prisma/seed.js || echo "WARNING: Seeding failed, continuing anyway..."

# Start the application
echo "Starting the application on port ${PORT:-3000}..."
exec node server.js
