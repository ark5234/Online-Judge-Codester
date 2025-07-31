#!/bin/bash

# EC2 Deployment Script for Compiler Service
# Run this on your EC2 instance

set -e

echo "🚀 Starting EC2 deployment for Compiler Service..."

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory
sudo mkdir -p /opt/codester-compiler
cd /opt/codester-compiler

# Create necessary directories
sudo mkdir -p code output temp logs

# Set permissions
sudo chown -R $USER:$USER /opt/codester-compiler

echo "✅ Docker and Docker Compose installed successfully!"

# Create environment file
cat > .env << EOF
FLASK_ENV=production
FLASK_APP=compiler.py
COMPILER_PORT=8000
MAX_EXECUTION_TIME=30
MAX_MEMORY_LIMIT=512
EOF

echo "✅ Environment file created!"

# Create systemd service
sudo tee /etc/systemd/system/codester-compiler.service > /dev/null << EOF
[Unit]
Description=Codester Compiler Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/codester-compiler
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable codester-compiler
sudo systemctl start codester-compiler

echo "✅ Compiler service installed and started!"

# Create nginx configuration for SSL (optional)
sudo tee /etc/nginx/sites-available/codester-compiler > /dev/null << EOF
server {
    listen 80;
    server_name your-compiler-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo "✅ Nginx configuration created!"
echo "🔧 Don't forget to:"
echo "   1. Update your-compiler-domain.com in nginx config"
echo "   2. Set up SSL certificate with Let's Encrypt"
echo "   3. Update CORS_ORIGIN in your backend"
echo "   4. Configure security groups for port 80/443"

echo "🎉 EC2 deployment completed successfully!" 