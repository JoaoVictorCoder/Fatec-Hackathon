#!/bin/sh
set -e

echo "Waiting for database..."
MAX_TRIES=20
TRY=1
APPLIED=0

while [ "$TRY" -le "$MAX_TRIES" ]; do
  echo "Attempt $TRY/$MAX_TRIES: applying migrations..."
  if npm run prisma:migrate:deploy; then
    APPLIED=1
    break
  fi

  echo "migrate deploy failed. Trying db push with accept-data-loss..."
  if npx prisma db push --accept-data-loss; then
    APPLIED=1
    break
  fi

  TRY=$((TRY + 1))
  sleep 2
done

if [ "$APPLIED" -ne 1 ]; then
  echo "Failed to apply database schema after $MAX_TRIES attempts."
  exit 1
fi

echo "Running seed..."
npm run seed

echo "Starting backend..."
npm run start
