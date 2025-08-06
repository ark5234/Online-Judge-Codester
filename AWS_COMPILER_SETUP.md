# AWS Compiler Service Setup Guide

## 🚀 **Step-by-Step AWS Deployment**

### **Prerequisites**
1. **AWS Account** - Create one at https://aws.amazon.com/
2. **AWS CLI** - Install from https://aws.amazon.com/cli/
3. **Docker** - Install from https://docker.com/

### **Step 1: Install and Configure AWS CLI**

```bash
# Install AWS CLI (Windows)
# Download from: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (us-east-1)
# - Default output format (json)
```

### **Step 2: Create AWS Resources**

Run these commands in PowerShell:

```powershell
# Set variables
$AWS_REGION = "ap-south-1"
$ECR_REPOSITORY = "codester-compiler"
$KEY_PAIR_NAME = "codester-compiler-key"

# Create ECR repository
aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION

# Create key pair
aws ec2 create-key-pair --key-name $KEY_PAIR_NAME --region $AWS_REGION --query 'KeyMaterial' --output text > "$KEY_PAIR_NAME.pem"

# Create security group
$SECURITY_GROUP_NAME = "codester-compiler-sg"
$sgId = aws ec2 create-security-group --group-name $SECURITY_GROUP_NAME --description "Security group for Codester Compiler" --region $AWS_REGION --query 'GroupId' --output text

# Add security group rules
aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 8000 --cidr 0.0.0.0/0 --region $AWS_REGION

# Get Ubuntu AMI
$AMI_ID = aws ec2 describe-images --owners 099720109477 --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*" "Name=state,Values=available" --query "reverse(sort_by(Images, &CreationDate))[0].ImageId" --output text --region $AWS_REGION

# Create EC2 instance
$instanceId = aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type t3.micro --key-name $KEY_PAIR_NAME --security-group-ids $sgId --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=codester-compiler}]" --region $AWS_REGION --query 'Instances[0].InstanceId' --output text

# Wait for instance to be running
aws ec2 wait instance-running --instance-ids $instanceId --region $AWS_REGION

# Get public IP
$publicIp = aws ec2 describe-instances --instance-ids $instanceId --region $AWS_REGION --query 'Reservations[0].Instances[0].PublicIpAddress' --output text

Write-Host "Instance created! IP: $publicIp"
```

### **Step 3: Deploy to ECR**

```bash
# Navigate to compiler service
cd compiler-service

# Build and push to ECR
./ecr-deploy.sh
```

### **Step 4: Deploy to EC2**

```bash
# Connect to EC2 instance
ssh -i codester-compiler-key.pem ubuntu@YOUR_EC2_IP

# Copy deployment script to EC2
scp -i codester-compiler-key.pem ecr-pull.sh ubuntu@YOUR_EC2_IP:~/

# On EC2, run:
chmod +x ecr-pull.sh
./ecr-pull.sh
```

### **Step 5: Update Backend Configuration**

Update your backend's environment variables:

```yaml
# In render.yaml or environment variables
COMPILER_SERVICE_URL: http://YOUR_EC2_IP:8000
```

### **Step 6: Test the Setup**

```bash
# Test compiler health
curl http://YOUR_EC2_IP:8000/health

# Test code execution
curl -X POST http://YOUR_EC2_IP:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, World!\")",
    "language": "python",
    "input": ""
  }'
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **AWS CLI not found**
   - Install AWS CLI from official website
   - Restart terminal after installation

2. **Permission denied on .pem file**
   ```bash
   chmod 400 codester-compiler-key.pem
   ```

3. **EC2 instance not accessible**
   - Check security group rules
   - Verify instance is running
   - Check your IP is allowed

4. **Docker not running on EC2**
   ```bash
   sudo systemctl start docker
   sudo usermod -aG docker $USER
   ```

## 📋 **Cost Estimation**

- **EC2 t3.micro**: ~$8-10/month (Free tier eligible)
- **ECR**: ~$0.10 per GB per month
- **Data Transfer**: Minimal for this setup

## 🎯 **Next Steps**

1. **Set up domain name** (optional)
2. **Configure SSL certificate** (recommended)
3. **Set up monitoring** (CloudWatch)
4. **Configure auto-scaling** (if needed)

## 📞 **Support**

If you encounter issues:
1. Check AWS CloudWatch logs
2. Verify security group settings
3. Test connectivity step by step
4. Review EC2 instance console output 