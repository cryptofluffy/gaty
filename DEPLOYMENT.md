# GatewayPro Dashboard - VPS Deployment Guide

## Deployment Optionen

### Option 1: Statische Dateien (Empfohlen)
```bash
# 1. Archive auf VPS hochladen
scp dashboard-production.tar.gz user@your-vps:/var/www/

# 2. Auf VPS extrahieren
ssh user@your-vps
cd /var/www/
tar -xzf dashboard-production.tar.gz
mv dist/ dashboard/

# 3. Nginx konfigurieren
sudo nano /etc/nginx/sites-available/dashboard
```

**Nginx Konfiguration:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    root /var/www/dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# 4. Site aktivieren
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Docker Deployment
```bash
# 1. Dockerfile erstellen
cat > Dockerfile << EOF
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
EOF

# 2. Nginx Config für Docker
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    gzip on;
    
    server {
        listen       80;
        server_name  localhost;
        root   /usr/share/nginx/html;
        index  index.html;
        
        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF

# 3. Docker Image builden und starten
docker build -t gatewayp ro-dashboard .
docker run -d -p 80:80 --name dashboard gatewaypro-dashboard
```

### Option 3: Node.js Server (mit serve)
```bash
# 1. Node.js installieren (falls nicht vorhanden)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. serve package installieren
npm install -g serve

# 3. Dashboard starten
serve -s dist/ -l 3000

# 4. Als Service einrichten (systemd)
sudo nano /etc/systemd/system/dashboard.service
```

**Systemd Service:**
```ini
[Unit]
Description=GatewayPro Dashboard
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dashboard
ExecStart=/usr/bin/serve -s . -l 3000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable dashboard
sudo systemctl start dashboard
```

## SSL/HTTPS Setup (Empfohlen)

### Mit Certbot (Let's Encrypt)
```bash
# 1. Certbot installieren
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. SSL Zertifikat erstellen
sudo certbot --nginx -d your-domain.com

# 3. Auto-Renewal testen
sudo certbot renew --dry-run
```

## Firewall Konfiguration
```bash
# UFW Firewall
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw enable
```

## Monitoring & Logs
```bash
# Nginx Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Service Status
sudo systemctl status nginx
sudo systemctl status dashboard  # wenn Node.js Service
```

## Backup Strategy
```bash
# Backup Script erstellen
cat > /usr/local/bin/backup-dashboard.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/dashboard_\$DATE.tar.gz /var/www/dashboard/
find /backups/ -name "dashboard_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-dashboard.sh

# Cron Job für tägliche Backups
echo "0 2 * * * /usr/local/bin/backup-dashboard.sh" | sudo crontab -
```

## Funktionen der App

### Login
- **Demo Accounts verfügbar:**
  - `demo@starter.com` - Starter Plan (1 Gateway)
  - `demo@pro.com` - Professional Plan (5 Gateways)
  - `demo@enterprise.com` - Enterprise Plan (50 Gateways)

### Features
- ✅ Dashboard mit System-Health
- ✅ VPS Manager 
- ✅ Port Forwards
- ✅ Gateway Management mit Edit/Delete
- ✅ Network Monitoring
- ✅ **License Management (vollständig funktional)**
  - Lizenz-Aktivierung mit Demo-Schlüsseln
  - Gateway-Nutzungsanzeige
  - Features-Liste
  - LocalStorage-Persistierung

### Demo-Lizenzschlüssel
- `STARTER-123-456` - Starter Plan
- `PRO-789-012` - Professional Plan  
- `ENT-345-678` - Enterprise Plan

## Troubleshooting

### App zeigt schwarze Seite
```bash
# Browser Console öffnen (F12) und Fehlermeldungen prüfen
# Meist fehlende Dateien oder MIME-Type Probleme

# Nginx MIME-Types prüfen
sudo nginx -T | grep mime.types
```

### Performance Optimierung
```bash
# Gzip in Nginx aktivieren (siehe Nginx Config oben)
# Static Asset Caching aktivieren
# CDN verwenden für bessere Performance weltweit
```

## Support
- Browser Developer Tools (F12) für JavaScript-Fehler
- Nginx Error Logs für Server-Probleme
- Network Tab für fehlende Ressourcen