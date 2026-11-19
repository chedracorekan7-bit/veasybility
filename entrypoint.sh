#!/bin/bash
set -e

echo "=== Veasybility Boot ==="

echo "[1/4] Running database migrations..."
php artisan migrate --force 2>&1 && echo "Migrations OK" || echo "WARNING: migrations failed (tables may already exist)"

echo "[2/4] Clearing config cache..."
php artisan config:clear 2>&1 || true

echo "[3/4] Clearing route & view cache..."
php artisan route:clear 2>&1 || true
php artisan view:clear 2>&1 || true

echo "[4/4] Starting Apache..."
exec apache2-foreground
