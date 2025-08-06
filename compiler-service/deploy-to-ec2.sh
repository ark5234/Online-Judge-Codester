#!/bin/bash

# Compiler Service Deployment Script for EC2
# Run this on the EC2 instance

echo "🚀 Starting Compiler Service Deployment..."

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

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/codester-compiler
cd /opt/codester-compiler

# Create necessary directories
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