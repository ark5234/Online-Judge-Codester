# ECR Deployment Script for Codester Compiler Service (PowerShell)
Write-Host "🚀 Starting ECR deployment for Codester Compiler Service..." -ForegroundColor Green

# Configuration
$ECR_REGISTRY = "public.ecr.aws/t1p1n3m8"
$IMAGE_NAME = "codester-compiler"
$TAG = "latest"

try {
    # Step 1: Authenticate Docker to ECR
    Write-Host "🔐 Authenticating Docker to ECR..." -ForegroundColor Yellow
    (Get-ECRLoginCommand).Password | docker login --username AWS --password-stdin public.ecr.aws/t1p1n3m8
    
    if ($LASTEXITCODE -ne 0) {
        throw "ECR authentication failed"
    }

    # Step 2: Build Docker image
    Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
    docker build -t $IMAGE_NAME .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed"
    }

    # Step 3: Tag the image for ECR
    Write-Host "🏷️ Tagging image for ECR..." -ForegroundColor Yellow
    docker tag "${IMAGE_NAME}:${TAG}" "${ECR_REGISTRY}/${IMAGE_NAME}:${TAG}"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker tag failed"
    }

    # Step 4: Push to ECR
    Write-Host "📤 Pushing image to ECR..." -ForegroundColor Yellow
    docker push "${ECR_REGISTRY}/${IMAGE_NAME}:${TAG}"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker push failed"
    }

    Write-Host "✅ ECR deployment completed!" -ForegroundColor Green
    Write-Host "📍 Image available at: ${ECR_REGISTRY}/${IMAGE_NAME}:${TAG}" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy to EC2 instance" -ForegroundColor White
    Write-Host "2. Update backend COMPILER_SERVICE_URL" -ForegroundColor White
    Write-Host "3. Test the deployment" -ForegroundColor White

} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}
