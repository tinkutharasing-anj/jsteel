FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port for web
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080 || exit 1

# Start the web app
CMD ["npm", "run", "web"]


