#!/bin/bash

# Welding App EC2 Deployment Script - Fixed Version
# This script deploys the welding app on EC2 alongside other sites

set -e

echo "🚀 Starting Welding App EC2 Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

echo "🌐 Detected EC2 IP: $EC2_IP"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Welding App Environment Variables
NODE_ENV=production
DB_PASSWORD=postgres123
JWT_SECRET=your_jwt_secret_here_change_in_production
EOF
    
    # Add the API URL with the detected IP
    echo "REACT_APP_API_URL=http://$EC2_IP:3002/api" >> .env
    
    echo "✅ .env file created successfully"
    echo "⚠️  Please edit .env file with secure values:"
    echo "   - Update DB_PASSWORD with a secure password"
    echo "   - Update JWT_SECRET with a secure secret"
    echo "   - REACT_APP_API_URL is set to: http://$EC2_IP:3002/api"
    echo ""
    read -p "Press Enter after reviewing .env file (or to continue with defaults)..."
else
    echo "✅ .env file already exists"
fi

# Load environment variables
if [ -f .env ]; then
    source .env
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found"
    exit 1
fi

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.ec2.yml down 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
docker compose -f docker-compose.ec2.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check service status
echo "📊 Checking service status..."
docker compose -f docker-compose.ec2.yml ps

# Test the API
echo "🧪 Testing API endpoint..."
if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is running on port 3002"
else
    echo "❌ Backend API is not responding"
fi

# Test the frontend
echo "🧪 Testing frontend..."
if curl -f http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 8081"
else
    echo "❌ Frontend is not responding"
fi

# Test the nginx proxy
echo "🧪 Testing nginx proxy..."
if curl -f http://localhost:8082 > /dev/null 2>&1; then
    echo "✅ Nginx proxy is running on port 8082"
else
    echo "❌ Nginx proxy is not responding"
fi

echo ""
echo "🎉 Welding App deployed successfully!"
echo ""
echo "📱 Access Points (Local):"
echo "   Frontend: http://localhost:8081"
echo "   Backend API: http://localhost:3002/api"
echo "   Nginx Proxy: http://localhost:8082"
echo "   Database: localhost:5433"
echo ""
echo "🌐 Access Points (External - from your IP):"
echo "   Frontend: http://$EC2_IP:8081"
echo "   Backend API: http://$EC2_IP:3002/api"
echo "   Nginx Proxy: http://$EC2_IP:8082"
echo ""
echo "🔧 For Multi-Site Setup:"
echo "   Copy ec2-main-nginx.conf to /etc/nginx/nginx.conf"
echo "   Your welding app will be accessible at: http://$EC2_IP/welding"
echo "   Your welding API will be accessible at: http://$EC2_IP/welding/api"
echo ""
echo "🌐 Update your EC2 security group to allow:"
echo "   - Port 80 (Main nginx - if using multi-site setup)"
echo "   - Port 8081 (Frontend - direct access)"
echo "   - Port 3002 (Backend API - direct access)"
echo "   - Port 8082 (Nginx Proxy - direct access)"
echo "   - Port 5433 (Database - optional, for direct access)"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker compose -f docker-compose.ec2.yml logs -f"
echo "   Stop services: docker compose -f docker-compose.ec2.yml down"
echo "   Restart services: docker compose -f docker-compose.ec2.yml restart"
echo "   Update: git pull && docker compose -f docker-compose.ec2.yml up -d --build"
echo ""
echo "📚 Next Steps:"
echo "   1. Test the app at http://$EC2_IP:8081"
echo "   2. Configure your main nginx for multi-site setup (optional)"
echo "   3. Set up monitoring and backups"
echo "   4. When you get a domain, update the nginx configs"
