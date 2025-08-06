#!/bin/bash

# ECR Deployment Script for Compiler Service
# Run this locally to build and push to ECR

set -e

# Configuration
AWS_REGION="ap-south-1"  # Mumbai region
ECR_REPOSITORY="codester-compiler"
ECR_IMAGE_TAG="latest"
PUBLIC_ECR_URI="public.ecr.aws"

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
PUBLIC_ECR_URI="public.ecr.aws"

echo "📦 Building Docker image..."
docker build -t ${ECR_REPOSITORY}:${ECR_IMAGE_TAG} .

echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

# Create public ECR repository if it doesn't exist
echo "🏗️ Creating public ECR repository if it doesn't exist..."
aws ecr-public describe-repositories --repository-names ${ECR_REPOSITORY} --region us-east-1 2>/dev/null || \
aws ecr-public create-repository --repository-name ${ECR_REPOSITORY} --region us-east-1

# Tag the image for public ECR
echo "🏷️ Tagging image for public ECR..."
docker tag ${ECR_REPOSITORY}:${ECR_IMAGE_TAG} ${PUBLIC_ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}

# Push to public ECR
echo "📤 Pushing image to public ECR..."
docker push ${PUBLIC_ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}

echo "✅ Image pushed successfully to public ECR!"
echo "🔗 Public ECR Image URI: ${PUBLIC_ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}"

# Create ECR pull script for EC2
cat > ecr-pull.sh << EOF
#!/bin/bash
# Pull and run the compiler service on EC2

# Pull the public image (no login required for public ECR)
docker pull ${PUBLIC_ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}

# Run the container
docker run -d \\
  --name codester-compiler \\
  -p 8000:8000 \\
  -v /opt/codester-compiler/code:/app/code \\
  -v /opt/codester-compiler/output:/app/output \\
  -v /opt/codester-compiler/temp:/app/temp \\
  --restart unless-stopped \\
  ${PUBLIC_ECR_URI}/${ECR_REPOSITORY}:${ECR_IMAGE_TAG}
EOF

chmod +x ecr-pull.sh

echo "✅ ECR deployment completed!"
echo "📋 Next steps:"
echo "   1. Copy ecr-pull.sh to your EC2 instance"
echo "   2. Run ecr-pull.sh on EC2 to deploy the service"
echo "   3. Update your backend's COMPILER_SERVICE_URL" 