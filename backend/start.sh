#!/bin/sh
set -e

echo "Aguardando banco..."
MAX_TRIES=20
TRY=1
APPLIED=0

while [ "$TRY" -le "$MAX_TRIES" ]; do
  echo "Tentativa $TRY/$MAX_TRIES: aplicando migrations..."
  if npm run prisma:migrate:deploy; then
    APPLIED=1
    break
  fi

  echo "migrate deploy falhou. Tentando db push com accept-data-loss..."
  if npx prisma db push --accept-data-loss; then
    APPLIED=1
    break
  fi

  TRY=$((TRY + 1))
  sleep 2
done

if [ "$APPLIED" -ne 1 ]; then
  echo "Falha ao aplicar schema do banco apos $MAX_TRIES tentativas."
  exit 1
fi

echo "Rodando seed..."
npm run seed

echo "Iniciando backend..."
npm run start
