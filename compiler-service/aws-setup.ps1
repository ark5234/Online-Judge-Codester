# AWS Setup Script for Compiler Service
# Run this after installing AWS CLI

Write-Host "🚀 Setting up AWS resources for Compiler Service..." -ForegroundColor Green

# Configuration
$AWS_REGION = "us-east-1"  # Change to your preferred region
$ECR_REPOSITORY = "codester-compiler"
$EC2_INSTANCE_TYPE = "t3.micro"  # Free tier eligible
$KEY_PAIR_NAME = "codester-compiler-key"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Region: $AWS_REGION"
Write-Host "   ECR Repository: $ECR_REPOSITORY"
Write-Host "   EC2 Instance Type: $EC2_INSTANCE_TYPE"
Write-Host "   Key Pair: $KEY_PAIR_NAME"

# Check if AWS CLI is configured
Write-Host "`n🔍 Checking AWS CLI configuration..." -ForegroundColor Yellow
try {
    $caller = aws sts get-caller-identity --query Account --output text 2>$null
    if ($caller) {
        Write-Host "✅ AWS CLI is configured. Account ID: $caller" -ForegroundColor Green
    } else {
        Write-Host "❌ AWS CLI is not configured. Please run 'aws configure' first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ AWS CLI is not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Create ECR repository
Write-Host "`n🏗️ Creating ECR repository..." -ForegroundColor Yellow
try {
    aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION
    Write-Host "✅ ECR repository created successfully!" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ ECR repository already exists or error occurred." -ForegroundColor Yellow
}

# Create key pair for EC2
Write-Host "`n🔑 Creating EC2 key pair..." -ForegroundColor Yellow
try {
    aws ec2 create-key-pair --key-name $KEY_PAIR_NAME --region $AWS_REGION --query 'KeyMaterial' --output text > "$KEY_PAIR_NAME.pem"
    Write-Host "✅ Key pair created successfully! Saved as $KEY_PAIR_NAME.pem" -ForegroundColor Green
    Write-Host "⚠️ Keep this file secure - you'll need it to connect to your EC2 instance" -ForegroundColor Red
} catch {
    Write-Host "ℹ️ Key pair already exists or error occurred." -ForegroundColor Yellow
}

# Create security group
Write-Host "`n🛡️ Creating security group..." -ForegroundColor Yellow
$SECURITY_GROUP_NAME = "codester-compiler-sg"
$SECURITY_GROUP_DESC = "Security group for Codester Compiler Service"

try {
    $sgId = aws ec2 create-security-group --group-name $SECURITY_GROUP_NAME --description $SECURITY_GROUP_DESC --region $AWS_REGION --query 'GroupId' --output text
    Write-Host "✅ Security group created! ID: $sgId" -ForegroundColor Green
    
    # Add rules
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $AWS_REGION
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 8000 --cidr 0.0.0.0/0 --region $AWS_REGION
    
    Write-Host "✅ Security group rules added!" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Security group already exists or error occurred." -ForegroundColor Yellow
}

# Get latest Ubuntu AMI
Write-Host "`n🖼️ Getting latest Ubuntu AMI..." -ForegroundColor Yellow
$AMI_ID = aws ec2 describe-images --owners 099720109477 --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*" "Name=state,Values=available" --query "reverse(sort_by(Images, &CreationDate))[0].ImageId" --output text --region $AWS_REGION
Write-Host "✅ Using AMI: $AMI_ID" -ForegroundColor Green

# Create EC2 instance
Write-Host "`n🖥️ Creating EC2 instance..." -ForegroundColor Yellow
$INSTANCE_NAME = "codester-compiler-instance"

try {
    $instanceId = aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type $EC2_INSTANCE_TYPE --key-name $KEY_PAIR_NAME --security-group-ids $sgId --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" --region $AWS_REGION --query 'Instances[0].InstanceId' --output text
    
    Write-Host "✅ EC2 instance created! ID: $instanceId" -ForegroundColor Green
    Write-Host "⏳ Waiting for instance to be running..." -ForegroundColor Yellow
    
    # Wait for instance to be running
    aws ec2 wait instance-running --instance-ids $instanceId --region $AWS_REGION
    
    # Get public IP
    $publicIp = aws ec2 describe-instances --instance-ids $instanceId --region $AWS_REGION --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
    
    Write-Host "✅ Instance is running! Public IP: $publicIp" -ForegroundColor Green
    
    # Save instance details
    @"
# AWS Compiler Service Instance Details
Instance ID: $instanceId
Public IP: $publicIp
Key Pair: $KEY_PAIR_NAME.pem
Security Group: $SECURITY_GROUP_NAME
Region: $AWS_REGION

# Connect to instance:
# ssh -i $KEY_PAIR_NAME.pem ubuntu@$publicIp

# ECR Repository:
# $ECR_REPOSITORY

# Next steps:
# 1. Connect to EC2 instance
# 2. Run the deployment script
# 3. Update backend COMPILER_SERVICE_URL
"@ | Out-File -FilePath "aws-instance-details.txt" -Encoding UTF8
    
    Write-Host "✅ Instance details saved to aws-instance-details.txt" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error creating EC2 instance: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 AWS setup completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Connect to your EC2 instance: ssh -i $KEY_PAIR_NAME.pem ubuntu@$publicIp" -ForegroundColor Cyan
Write-Host "2. Copy the deployment scripts to EC2" -ForegroundColor Cyan
Write-Host "3. Run the deployment on EC2" -ForegroundColor Cyan
Write-Host "4. Update your backend's COMPILER_SERVICE_URL" -ForegroundColor Cyan 