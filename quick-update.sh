#!/bin/bash

# Quick Update Script - Optimiert für Geschwindigkeit
echo "🚀 Quick Dashboard Update (optimiert)..."

cd /root/dashboard

# Code updaten
echo "📥 Pulling latest code..."
git pull origin main

# Lokalen Build (schneller als Docker)
echo "🔨 Building locally..."
npm install --production
npm run build

# Neue Version direkt in Container kopieren (ohne Rebuild)
echo "📦 Updating container files..."
docker cp dist/. dashboard:/usr/share/nginx/html/

# Nginx reload (ohne Container-Neustart)
echo "🔄 Reloading nginx..."
docker exec dashboard nginx -s reload

echo "✅ Quick update complete!"
docker ps | grep dashboard