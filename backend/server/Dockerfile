FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create .env file with default values
RUN echo "MONGO_URI=mongodb://mongo:27017/oj\nREDIS_URL=redis://redis:6379\nJWT_SECRET=your_jwt_secret\nPORT=3001\nNODE_ENV=production" > .env

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 