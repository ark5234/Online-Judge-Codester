FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    openjdk-11-jdk \
    g++ \
    gcc \
    make \
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install flask flask-cors psutil

# Create app directory
WORKDIR /app

# Copy the compiler service
COPY compiler.py .

# Create directories for code execution
RUN mkdir -p /app/code /app/output /app/temp

# Set permissions
RUN chmod +x /app/compiler.py

# Expose default port (can be overridden by PORT env)
EXPOSE 8000

# Run the compiler service
CMD ["python3", "compiler.py"] 