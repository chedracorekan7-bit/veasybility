#!/bin/bash
set -e

# Exécution automatique des migrations sur la base de données
echo "Running database migrations..."
php artisan migrate --force || true

# Nettoyage des caches au démarrage
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Lancement d'Apache
echo "Starting Apache..."
exec apache2-foreground
