#!/bin/bash

# Dashboard VPS Installation Script
# Usage: ./install-dashboard.sh [domain]
# Example: ./install-dashboard.sh dashboard.example.com

set -e

DOMAIN=${1:-"localhost"}
CONTAINER_NAME="dashboard"
CONTAINER_PORT="8080"

echo "🚀 Dashboard VPS Installation"
echo "=============================="
echo "Domain: $DOMAIN"
echo "Container: $CONTAINER_NAME"
echo "Port: $CONTAINER_PORT"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✅ Docker installed"
fi

# Install other dependencies
echo "📦 Installing dependencies..."
apt install -y nginx certbot python3-certbot-nginx ufw curl

# Configure firewall
echo "🔥 Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Stop and remove existing container
echo "🛑 Stopping existing containers..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Build Docker image locally (since we don't have GitHub Actions yet)
echo "🔨 Building Docker image..."
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found. Make sure you're in the dashboard directory."
    exit 1
fi

# Build the image
docker build -t $CONTAINER_NAME .

# Run new container
echo "🐳 Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $CONTAINER_PORT:80 \
    $CONTAINER_NAME

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check container status
if docker ps | grep $CONTAINER_NAME > /dev/null; then
    echo "✅ Container started successfully"
else
    echo "❌ Container failed to start. Checking logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Configure Nginx proxy
echo "🌐 Configuring Nginx reverse proxy..."
cat > /etc/nginx/sites-available/dashboard << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:$CONTAINER_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site and restart Nginx
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

# Setup SSL if domain is not localhost
if [ "$DOMAIN" != "localhost" ]; then
    echo "🔒 Setting up SSL certificate..."
    read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || echo "⚠️ SSL setup failed, but dashboard is still accessible via HTTP"
        echo "✅ SSL certificate setup attempted"
    fi
fi

# Create management scripts
echo "📝 Creating management scripts..."

# Update script
cat > /usr/local/bin/update-dashboard.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating Dashboard..."

# Rebuild image
cd /root/dashboard
docker build -t dashboard .

# Stop and remove old container
docker stop dashboard
docker rm dashboard

# Start new container
docker run -d \
    --name dashboard \
    --restart unless-stopped \
    -p 8080:80 \
    dashboard

echo "✅ Dashboard updated successfully!"
docker ps | grep dashboard
EOF

chmod +x /usr/local/bin/update-dashboard.sh

# Monitor script
cat > /usr/local/bin/monitor-dashboard.sh << 'EOF'
#!/bin/bash
if ! docker ps | grep dashboard > /dev/null; then
    echo "❌ Dashboard container is not running. Attempting restart..."
    docker start dashboard || {
        echo "Failed to start container. Check logs:"
        docker logs dashboard
    }
fi
EOF

chmod +x /usr/local/bin/monitor-dashboard.sh

# Setup cron for monitoring
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-dashboard.sh >> /var/log/dashboard-monitor.log 2>&1") | crontab -

echo ""
echo "🎉 Installation Complete!"
echo "======================="
echo ""
echo "📊 Container Status:"
docker ps | grep dashboard || echo "❌ Container not running"

echo ""
echo "🌐 Access your dashboard:"
if [ "$DOMAIN" != "localhost" ]; then
    echo "   HTTP:  http://$DOMAIN"
    echo "   HTTPS: https://$DOMAIN (if SSL was configured)"
else
    echo "   Local: http://localhost"
    echo "   VPS IP: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR-VPS-IP')"
fi

echo ""
echo "👥 Demo Accounts:"
echo "   demo@starter.com - Starter Plan (1 Gateway)"
echo "   demo@pro.com - Professional Plan (5 Gateways)"
echo "   demo@enterprise.com - Enterprise Plan (50 Gateways)"

echo ""
echo "🔧 Management Commands:"
echo "   Update:        /usr/local/bin/update-dashboard.sh"
echo "   Restart:       docker restart dashboard"
echo "   Logs:          docker logs dashboard -f"
echo "   Shell access:  docker exec -it dashboard sh"
echo "   Monitor:       docker stats dashboard"

echo ""
echo "✅ Ready to use! Open your browser and navigate to the dashboard."