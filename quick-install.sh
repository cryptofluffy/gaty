#!/bin/bash

# Dashboard Quick Install - Komplett frischer Server
# Usage: curl -sSL https://raw.githubusercontent.com/cryptofluffy/gateway-project/main/quick-install.sh | bash -s -- [domain]
# Example: curl -sSL https://raw.githubusercontent.com/cryptofluffy/gateway-project/main/quick-install.sh | bash -s -- dashboard.example.com

set -e

DOMAIN=${1:-""}
REPO_URL="https://github.com/cryptofluffy/gaty.git"
INSTALL_DIR="/root/dashboard"

echo "🚀 Dashboard Quick Install - Frischer Server"
echo "============================================="
echo "Domain: $DOMAIN"
echo "Repository: $REPO_URL"
echo "Install Directory: $INSTALL_DIR"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root"
   echo "Run: sudo su - && curl -sSL ... | bash"
   exit 1
fi

# Update system first
echo "📦 System Update..."
apt update && apt upgrade -y

# Install basic tools
echo "🔧 Installing basic tools..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Install Node.js (needed for building)
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo "✅ Node.js installed"
else
    echo "✅ Node.js already installed"
fi

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx certbot python3-certbot-nginx

# Configure firewall
echo "🔥 Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Download dashboard code
echo "📥 Downloading dashboard code..."
rm -rf $INSTALL_DIR
git clone $REPO_URL $INSTALL_DIR
cd $INSTALL_DIR

# Build and start dashboard
echo "🔨 Building dashboard..."
npm install
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t dashboard .

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker stop dashboard 2>/dev/null || true
docker rm dashboard 2>/dev/null || true

# Start new container
echo "🚀 Starting dashboard container..."
docker run -d \
    --name dashboard \
    --restart unless-stopped \
    -p 8080:80 \
    dashboard

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Check container status
if docker ps | grep dashboard > /dev/null; then
    echo "✅ Container started successfully"
else
    echo "❌ Container failed to start. Checking logs:"
    docker logs dashboard
    exit 1
fi

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/dashboard << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    
    # Main proxy
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Login rate limiting
    location /api/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Block common attack paths
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \\.(git|env|sql|log|bak)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl enable nginx
systemctl restart nginx

# Skip SSL setup for IP-only access
if [ "$DOMAIN" != "" ]; then
    echo "🔒 Setting up SSL certificate for domain: $DOMAIN"
    echo "Updating Nginx config for domain..."
    
    # Update server_name in config
    sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/sites-available/dashboard
    systemctl restart nginx
    
    # Try to get SSL certificate
    if certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect; then
        echo "✅ SSL certificate installed successfully"
    else
        echo "⚠️ SSL setup failed, but dashboard is accessible via HTTP"
        echo "You can manually run: certbot --nginx -d $DOMAIN"
    fi
else
    echo "ℹ️ No domain specified - dashboard will be accessible via server IP"
fi

# Create management scripts
echo "📝 Creating management scripts..."

# Update script
cat > /usr/local/bin/update-dashboard.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating Dashboard..."

cd /root/dashboard

# Pull latest code
git pull origin main

# Rebuild
npm install
npm run build
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
    echo "$(date): Dashboard container is not running. Attempting restart..." >> /var/log/dashboard-monitor.log
    docker start dashboard || {
        echo "$(date): Failed to start container. Check logs:" >> /var/log/dashboard-monitor.log
        docker logs dashboard >> /var/log/dashboard-monitor.log 2>&1
    }
fi
EOF

chmod +x /usr/local/bin/monitor-dashboard.sh

# Setup cron for monitoring
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-dashboard.sh") | crontab -

# Setup log rotation
cat > /etc/logrotate.d/dashboard << 'EOF'
/var/log/dashboard-monitor.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

# Create system service (optional)
cat > /etc/systemd/system/dashboard-monitor.service << 'EOF'
[Unit]
Description=Dashboard Monitor
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/monitor-dashboard.sh
User=root

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/dashboard-monitor.timer << 'EOF'
[Unit]
Description=Run Dashboard Monitor every 5 minutes
Requires=dashboard-monitor.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable dashboard-monitor.timer
systemctl start dashboard-monitor.timer

# Final status check
echo ""
echo "🎉 Installation Complete!"
echo "========================="
echo ""

# Container status
echo "📊 Container Status:"
if docker ps | grep dashboard > /dev/null; then
    echo "✅ Dashboard container is running"
    docker ps | grep dashboard
else
    echo "❌ Dashboard container is not running"
    echo "Logs:"
    docker logs dashboard
fi

echo ""
echo "🌐 Access your dashboard:"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "YOUR-SERVER-IP")
if [ "$DOMAIN" != "" ]; then
    echo "   HTTP:  http://$DOMAIN"
    if certbot certificates 2>/dev/null | grep -q $DOMAIN; then
        echo "   HTTPS: https://$DOMAIN"
    fi
    echo "   IP:    http://$SERVER_IP (also works)"
else
    echo "   IP:    http://$SERVER_IP"
    echo "   Local: http://localhost (from server)"
    echo ""
    echo "💡 To add a domain later:"
    echo "   1. Point your domain DNS to this IP: $SERVER_IP"
    echo "   2. Run: certbot --nginx -d yourdomain.com"
fi

echo ""
echo "👥 Demo Accounts:"
echo "   📧 demo@starter.com - Starter Plan (1 Gateway)"
echo "   📧 demo@pro.com - Professional Plan (5 Gateways)"
echo "   📧 demo@enterprise.com - Enterprise Plan (50 Gateways)"

echo ""
echo "🔧 Management Commands:"
echo "   Update:     /usr/local/bin/update-dashboard.sh"
echo "   Restart:    docker restart dashboard"
echo "   Logs:       docker logs dashboard -f"
echo "   Monitor:    docker stats dashboard"
echo "   Shell:      docker exec -it dashboard sh"

echo ""
echo "📁 Important Paths:"
echo "   Dashboard:  $INSTALL_DIR"
echo "   Nginx:      /etc/nginx/sites-available/dashboard"
echo "   Logs:       /var/log/dashboard-monitor.log"

echo ""
echo "🔒 Security Features:"
echo "   ✅ Firewall configured (UFW)"
echo "   ✅ Rate limiting on login"
echo "   ✅ Security headers"
echo "   ✅ Container monitoring"
if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "" ]; then
    if certbot certificates 2>/dev/null | grep -q $DOMAIN; then
        echo "   ✅ SSL certificate installed"
    else
        echo "   ⚠️ SSL certificate setup failed"
    fi
fi

echo ""
echo "✅ Ready to use! Open your browser and navigate to the dashboard."
echo ""
echo "📝 Note: If you need to update the dashboard later, run:"
echo "   /usr/local/bin/update-dashboard.sh"