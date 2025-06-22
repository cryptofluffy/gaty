#!/bin/bash

# GatewayPro Dashboard - GitHub Docker Deployment Script
# Usage: ./deploy-github-docker.sh [github-username] [repo-name] [domain] [tag]
# Example: ./deploy-github-docker.sh myuser dashboard-test dashboard.example.com latest

set -e

GITHUB_USER=${1:-""}
REPO_NAME=${2:-"dashboard-test"}
DOMAIN=${3:-"localhost"}
TAG=${4:-"latest"}

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Error: GitHub username required"
    echo "Usage: ./deploy-github-docker.sh [github-username] [repo-name] [domain] [tag]"
    echo "Example: ./deploy-github-docker.sh myuser dashboard-test dashboard.example.com latest"
    exit 1
fi

IMAGE_NAME="ghcr.io/${GITHUB_USER}/${REPO_NAME}:${TAG}"

echo "🚀 GatewayPro Dashboard - GitHub Docker Deployment"
echo "=================================================="
echo "GitHub User: $GITHUB_USER"
echo "Repository: $REPO_NAME"
echo "Domain: $DOMAIN"
echo "Image: $IMAGE_NAME"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ Don't run this script as root. Use a sudo user instead."
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed. Please log out and back in for group changes to take effect."
fi

# Install other dependencies
echo "📦 Installing dependencies..."
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Stop and remove existing container
echo "🛑 Stopping existing containers..."
sudo docker stop dashboard 2>/dev/null || true
sudo docker rm dashboard 2>/dev/null || true

# Pull latest image from GitHub Container Registry
echo "📥 Pulling Docker image from GitHub..."
echo "Note: If this is a private repository, you need to login first:"
echo "docker login ghcr.io -u $GITHUB_USER"
echo ""

# Try to pull the image
if sudo docker pull $IMAGE_NAME; then
    echo "✅ Successfully pulled $IMAGE_NAME"
else
    echo "❌ Failed to pull image. If this is a private repository, please run:"
    echo "docker login ghcr.io -u $GITHUB_USER"
    echo "Then run this script again."
    exit 1
fi

# Run new container
echo "🐳 Starting new container..."
sudo docker run -d \
    --name dashboard \
    --restart unless-stopped \
    -p 8080:80 \
    $IMAGE_NAME

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check container status
if sudo docker ps | grep dashboard > /dev/null; then
    echo "✅ Container started successfully"
else
    echo "❌ Container failed to start. Checking logs:"
    sudo docker logs dashboard
    exit 1
fi

# Configure Nginx proxy
echo "🌐 Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/dashboard > /dev/null << EOF
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
        proxy_pass http://localhost:8080;
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
sudo ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# Setup SSL if domain is not localhost
if [ "$DOMAIN" != "localhost" ]; then
    echo "🔒 Setting up SSL certificate..."
    read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || true
        echo "✅ SSL certificate setup attempted"
    fi
fi

# Create update script
echo "📝 Creating update script..."
sudo tee /usr/local/bin/update-dashboard.sh > /dev/null << EOF
#!/bin/bash
echo "🔄 Updating GatewayPro Dashboard..."

# Pull latest image
docker pull $IMAGE_NAME

# Stop and remove old container
docker stop dashboard
docker rm dashboard

# Start new container
docker run -d \\
    --name dashboard \\
    --restart unless-stopped \\
    -p 8080:80 \\
    $IMAGE_NAME

echo "✅ Dashboard updated successfully!"
docker ps | grep dashboard
EOF

sudo chmod +x /usr/local/bin/update-dashboard.sh

# Create monitoring script
sudo tee /usr/local/bin/monitor-dashboard.sh > /dev/null << 'EOF'
#!/bin/bash
if ! docker ps | grep dashboard > /dev/null; then
    echo "❌ Dashboard container is not running. Attempting restart..."
    docker start dashboard || {
        echo "Failed to start container. Check logs:"
        docker logs dashboard
    }
fi
EOF

sudo chmod +x /usr/local/bin/monitor-dashboard.sh

# Setup cron for monitoring
(sudo crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-dashboard.sh >> /var/log/dashboard-monitor.log 2>&1") | sudo crontab -

echo ""
echo "🎉 Deployment Complete!"
echo "====================="
echo ""
echo "📊 Container Status:"
sudo docker ps | grep dashboard || echo "❌ Container not running"

echo ""
echo "🌐 Access your dashboard:"
if [ "$DOMAIN" != "localhost" ]; then
    echo "   HTTP:  http://$DOMAIN"
    echo "   HTTPS: https://$DOMAIN (if SSL was configured)"
else
    echo "   Local: http://localhost"
fi

echo ""
echo "👥 Demo Accounts:"
echo "   demo@starter.com - Starter Plan (1 Gateway)"
echo "   demo@pro.com - Professional Plan (5 Gateways)"
echo "   demo@enterprise.com - Enterprise Plan (50 Gateways)"

echo ""
echo "🔧 Management Commands:"
echo "   Update:        sudo /usr/local/bin/update-dashboard.sh"
echo "   Restart:       sudo docker restart dashboard"
echo "   Logs:          sudo docker logs dashboard -f"
echo "   Shell access:  sudo docker exec -it dashboard sh"
echo "   Monitor:       sudo docker stats dashboard"

echo ""
echo "📈 Image Information:"
echo "   Repository: $IMAGE_NAME"
echo "   To update: sudo /usr/local/bin/update-dashboard.sh"

echo ""
echo "✅ Ready to use! Open $DOMAIN in your browser."