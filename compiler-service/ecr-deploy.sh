#!/bin/bash

# ECR Deployment Script for Compiler Service
# Run this locally to build and push to ECR

set -e

# Configuration
AWS_REGION="us-east-1"  # Change to your region
ECR_REPOSITORY="codester-compiler"
ECR_IMAGE_TAG="latest"

echo "🚀 Starting ECR deployment for Compiler Service..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "📦 Building Docker image..."
docker build -t ${ECR_REPOSITORY}:${ECR_IMAGE_TAG} .

echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

# Create ECR repository if it doesn't exist
echo "🏗️ Creating ECR repository if it doesn't exist..."
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} 2>/dev/null || \
aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION}

# Tag the image
echo "🏷️ Tagging image..."
docker tag ${ECR_REPOSITORY}:${ECR_IMAGE_TAG} ${ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}

# Push to ECR
echo "📤 Pushing image to ECR..."
docker push ${ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}

echo "✅ Image pushed successfully to ECR!"
echo "🔗 ECR Image URI: ${ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}"

# Create ECR pull script for EC2
cat > ecr-pull.sh << EOF
#!/bin/bash
# Pull and run the compiler service on EC2

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

# Pull the image
docker pull ${ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}

# Run the container
docker run -d \\
  --name codester-compiler \\
  -p 8000:8000 \\
  -v /opt/codester-compiler/code:/app/code \\
  -v /opt/codester-compiler/output:/app/output \\
  -v /opt/codester-compiler/temp:/app/temp \\
  --restart unless-stopped \\
  ${ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}
EOF

chmod +x ecr-pull.sh

echo "✅ ECR deployment completed!"
echo "📋 Next steps:"
echo "   1. Copy ecr-pull.sh to your EC2 instance"
echo "   2. Run ecr-pull.sh on EC2 to deploy the service"
echo "   3. Update your backend's COMPILER_SERVICE_URL" 