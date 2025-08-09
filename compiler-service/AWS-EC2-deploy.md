# Deploy compiler-service on AWS EC2 (Ubuntu)

This deploys the Dockerized compiler-service to an EC2 instance and exposes port 8000.

## Prerequisites

- AWS account + key pair (.pem)
- EC2 Ubuntu 22.04 t2.small (2GB) or larger
- Security group allowing inbound TCP 8000 from your backend IPs

## Steps

1. SSH into EC2

```bash
ssh -i /path/to/your-key.pem ubuntu@EC2_PUBLIC_IP
```

1. Install Docker

```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

1. Copy the repo or pull only compiler-service

- Option A: Clone the repo

```bash
git clone https://github.com/ark5234/Online-Judge-Codester.git
cd Online-Judge-Codester
```

- Option B: Copy only the folder via scp (from your Windows):

```powershell
scp -i C:\\path\\to\\your-key.pem -r compiler-service ubuntu@EC2_PUBLIC_IP:~/compiler-service
```

1. Build the image and run

```bash
cd compiler-service
sudo docker build -t codester-compiler:latest .
sudo docker run -d --name codester-compiler -p 8000:8000 --restart always codester-compiler:latest
```

1. Verify

```bash
curl http://EC2_PUBLIC_IP:8000/health
```

You should see `{ "status": "OK", ... }`.

1. Point the backend to EC2

- In Render backend env vars, set:

```bash
COMPILER_SERVICE_URL=http://EC2_PUBLIC_IP:8000
```

- Redeploy backend.

## Notes

- The Dockerfile installs python3, node, javac, g++, so remote compile supports Python/JS/Java/C++.
- For HTTPS, place behind an ALB or run on an Azure Container Instance (script included) if you prefer Azure credits.
