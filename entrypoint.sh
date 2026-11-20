#!/bin/bash
set -e

echo "=== Veasybility Boot ==="

# Génère un fichier .env depuis les variables d'environnement Render
echo "[0/5] Generating .env from environment variables..."
cat > /var/www/html/.env << EOF
APP_NAME=${APP_NAME:-Veasybility}
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}

LOG_CHANNEL=${LOG_CHANNEL:-stack}
LOG_LEVEL=${LOG_LEVEL:-error}

DB_CONNECTION=${DB_CONNECTION:-pgsql}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

CACHE_DRIVER=${CACHE_DRIVER:-file}
FILESYSTEM_DISK=${FILESYSTEM_DISK:-local}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}
SESSION_DRIVER=${SESSION_DRIVER:-file}
SESSION_LIFETIME=${SESSION_LIFETIME:-120}

MAIL_MAILER=${MAIL_MAILER:-smtp}
MAIL_HOST=${MAIL_HOST:-smtp.gmail.com}
MAIL_PORT=${MAIL_PORT:-465}
MAIL_USERNAME=${MAIL_USERNAME}
MAIL_PASSWORD=${MAIL_PASSWORD}
MAIL_ENCRYPTION=${MAIL_ENCRYPTION:-smtps}
MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS}
MAIL_FROM_NAME=${MAIL_FROM_NAME:-Veasybility}

GROQ_API_KEY=${GROQ_API_KEY}

ADMIN_API_KEY=${ADMIN_API_KEY:-veasybility-secret-key-2026}
EOF
echo ".env generated OK"

echo "[1/5] Running database migrations..."
php artisan migrate --force 2>&1 && echo "Migrations OK" || echo "WARNING: migrations failed"

echo "[2/5] Caching config..."
php artisan config:cache 2>&1 || true

echo "[3/5] Caching routes..."
php artisan route:cache 2>&1 || true

echo "[4/5] Clearing view cache..."
php artisan view:clear 2>&1 || true

echo "[5/5] Starting Apache..."
exec apache2-foreground
