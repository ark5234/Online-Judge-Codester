#!/bin/bash

# Compiler Service Deployment Script for EC2
# Run this on the EC2 instance

echo "🚀 Starting Compiler Service Deployment..."

# Configuration
ECR_REGISTRY="public.ecr.aws/t1p1n3m8"
IMAGE_NAME="codester-compiler"
TAG="latest"
CONTAINER_NAME="codester-compiler"
PORT="8000"

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker

# Start and enable Docker
echo "🔧 Starting Docker service..."
sudo service docker start
sudo systemctl enable docker

# Add user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -a -G docker ec2-user

# Install AWS CLI v2
echo "☁️ Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Authenticate with ECR
echo "🔐 Authenticating with ECR..."
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

# Stop existing container if running
echo "� Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Pull latest image from ECR
echo "📥 Pulling latest image from ECR..."
docker pull $ECR_REGISTRY/$IMAGE_NAME:$TAG

# Run the container
echo "🏃 Starting container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:$PORT \
  -v /tmp/codester:/tmp \
  --memory=2g \
  --cpus=2 \
  $ECR_REGISTRY/$IMAGE_NAME:$TAG

# Check if container is running
echo "🔍 Checking container status..."
sleep 5
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Container is running successfully!"
    
    # Test the service
    echo "🧪 Testing the service..."
    sleep 10
    curl -f http://localhost:$PORT/health || echo "⚠️ Health check failed"
    
    echo ""
    echo "🎉 Deployment completed!"
    echo "📍 Service running on port $PORT"
    echo "🌐 Access via: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$PORT"
    echo ""
    echo "🔧 Useful commands:"
    echo "  View logs: docker logs $CONTAINER_NAME"
    echo "  Restart: docker restart $CONTAINER_NAME"
    echo "  Stop: docker stop $CONTAINER_NAME"
else
    echo "❌ Container failed to start!"
    echo "📋 Container logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Setup log rotation
echo "📜 Setting up log rotation..."
sudo tee /etc/logrotate.d/docker-codester > /dev/null <<EOF
/var/lib/docker/containers/*/*-json.log {
    rotate 5
    daily
    compress
    size=50M
    missingok
    notifempty
    sharedscripts
    copytruncate
}
EOF

# Create monitoring script
echo "📊 Creating monitoring script..."
sudo tee /usr/local/bin/monitor-codester.sh > /dev/null <<EOF
#!/bin/bash
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "Container not running, restarting..."
    docker restart $CONTAINER_NAME
fi
EOF
sudo chmod +x /usr/local/bin/monitor-codester.sh

# Add to crontab for monitoring
echo "⏰ Setting up monitoring cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-codester.sh") | crontab -

echo "✅ All setup completed!"
echo ""
echo "📋 Next steps for your backend:"
echo "1. Update COMPILER_SERVICE_URL in your .env file"
echo "2. Set it to: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$PORT"
echo "3. Restart your backend service"
sudo mkdir -p code output temp logs

# Set permissions
sudo chown -R ec2-user:ec2-user /opt/codester-compiler

echo "✅ Docker installation completed!"

# Pull and run the compiler service
echo "📥 Pulling compiler service image..."
docker pull public.ecr.aws/t1p1n3m8/codester-compiler:latest

echo "🚀 Starting compiler service..."
docker run -d \
  --name codester-compiler \
  -p 8000:8000 \
  -v /opt/codester-compiler/code:/app/code \
  -v /opt/codester-compiler/output:/app/output \
  -v /opt/codester-compiler/temp:/app/temp \
  --restart unless-stopped \
  public.ecr.aws/t1p1n3m8/codester-compiler:latest

# Wait a moment for the container to start
sleep 5

# Test the service
echo "🧪 Testing compiler service..."
curl -f http://localhost:8000/health

if [ $? -eq 0 ]; then
    echo "✅ Compiler service is running successfully!"
    echo "🌐 Service URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"
else
    echo "❌ Compiler service failed to start"
    echo "📋 Container logs:"
    docker logs codester-compiler
fi

echo "🎉 Deployment completed!" 