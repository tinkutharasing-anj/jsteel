#!/bin/bash

# Welding App EC2 Deployment Script - Enhanced with Production Optimization
# This script deploys the welding app on EC2 alongside other sites

set -e

echo "🚀 Starting Welding App EC2 Deployment with Production Optimization..."

# Domain for production deployment (can be overridden by exporting DOMAIN)
DOMAIN=${DOMAIN:-career.anjamerica.com}
SCHEME=https

# Portable sed -i for GNU/BSD
sedi() {
    if sed --version >/dev/null 2>&1; then
        sed -i "$@"
    else
        sed -i '' "$@"
    fi
}

# Select docker compose command (supports both v2 plugin and legacy docker-compose)
if docker compose version >/dev/null 2>&1; then
    dc() { docker compose "$@"; }
elif command -v docker-compose >/dev/null 2>&1; then
    dc() { docker-compose "$@"; }
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' is available. Please install Docker Compose."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

echo "�� Detected EC2 IP: $EC2_IP"

# Non-interactive deployment selection (default to production)
DEPLOY_CHOICE=${DEPLOY_CHOICE:-2}
echo "🎯 Deployment type: $DEPLOY_CHOICE"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "�� Creating .env file..."
    cat > .env << 'ENVEOF'
# Welding App Environment Variables
NODE_ENV=production
DB_PASSWORD=postgres123
JWT_SECRET=your_jwt_secret_here_change_in_production
ENVEOF
    
    # Add the API URL pointing to the production domain over HTTPS
    echo "REACT_APP_API_URL=${SCHEME}://${DOMAIN}/api" >> .env
    
    echo "✅ .env file created successfully"
    echo "⚠️  Please edit .env file with secure values:"
    echo "   - Update DB_PASSWORD with a secure password"
    echo "   - Update JWT_SECRET with a secure secret"
    echo "   - REACT_APP_API_URL is set to: http://$EC2_IP:3001/api"
    echo ""
    read -p "Press Enter after updating .env file (or to continue with defaults)..."
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
dc down --remove-orphans 2>/dev/null || true
dc -f docker-compose.ec2.yml down --remove-orphans 2>/dev/null || true
dc -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Force remove any leftover containers so re-runs don't fail with name collisions
docker rm -f welding_app_db welding_app_backend welding_app_frontend welding_app_nginx 2>/dev/null || true

# Handle different deployment types
case $DEPLOY_CHOICE in
    1)
        echo "🔨 Starting standard deployment..."
        dc up -d --build
        FRONTEND_PORT=8080
        BACKEND_PORT=3001
        DB_PORT=5432
        ;;
    2|3)
        echo "🔨 Starting production deployment..."
        
        # Create production docker-compose if it doesn't exist
        if [ ! -f docker-compose.prod.yml ]; then
            echo "📝 Creating production docker-compose.yml..."
            cat > docker-compose.prod.yml << 'PRODEOF'
version: '3.7'

services:
  welding_postgres:
    image: postgres:15-alpine
    container_name: welding_app_db
    environment:
      POSTGRES_DB: welding_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5433:5432"
    volumes:
      - welding_postgres_data:/var/lib/postgresql/data
      - ./backend/config/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    networks:
      - welding_network
    restart: unless-stopped

  welding_backend:
    image: node:18-alpine
    container_name: welding_app_backend
    working_dir: /app
    environment:
      PORT: 3001
      NODE_ENV: production
      DB_USER: postgres
      DB_HOST: welding_postgres
      DB_NAME: welding_app
      DB_PASSWORD: postgres123
      DB_PORT: 5432
      JWT_SECRET: your_jwt_secret_here_change_in_production
    ports:
      - "3002:3001"
    depends_on:
      - welding_postgres
    volumes:
      - ./backend:/app
      - ./backend/uploads:/app/uploads
    networks:
      - welding_network
    command: sh -c "npm install --production && npm start"
    restart: unless-stopped

volumes:
  welding_postgres_data:

networks:
  welding_network:
    driver: bridge
PRODEOF
        fi
        
        # Ensure .env points API to the production domain over HTTPS
        sedi "s|^REACT_APP_API_URL=.*$|REACT_APP_API_URL=${SCHEME}://${DOMAIN}/api|g" .env
        
        dc -f docker-compose.prod.yml up -d --build
        FRONTEND_PORT=8081
        BACKEND_PORT=3002
        DB_PORT=5433
        
        # Cleanup if option 3 was chosen
        if [ "$DEPLOY_CHOICE" = "3" ]; then
            echo "🧹 Cleaning up development files..."
            rm -rf __tests__/ e2e/ coverage/ test-results/ playwright-report/ 2>/dev/null || true
            rm -f *.test.* *.spec.* test-*.js jest.config.js jest.setup.js playwright.config.js .detoxrc.js 2>/dev/null || true
            echo "✅ Cleanup completed"
        fi
        ;;
    *)
        echo "❌ Invalid choice. Using standard deployment..."
        dc up -d --build
        FRONTEND_PORT=8080
        BACKEND_PORT=3001
        DB_PORT=5432
        ;;
esac

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 20

# Check service status
echo "📊 Checking service status..."
if [ "$DEPLOY_CHOICE" = "1" ]; then
    dc ps
else
    dc -f docker-compose.prod.yml ps
fi

# Test the API
echo "🧪 Testing API endpoint..."
if curl -f http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is running on port $BACKEND_PORT"
else
    echo "❌ Backend API is not responding"
fi

# Test the frontend (if available)
if [ "$DEPLOY_CHOICE" = "1" ]; then
    echo "🧪 Testing frontend..."
    if curl -f http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "✅ Frontend is running on port $FRONTEND_PORT"
    else
        echo "❌ Frontend is not responding"
    fi
fi

echo ""
echo "🎉 Welding App deployed successfully!"
echo ""
echo "📱 Access Points (Local):"
echo "   Backend API: http://localhost:$BACKEND_PORT/api"
echo "   Database: localhost:$DB_PORT"
if [ "$DEPLOY_CHOICE" = "1" ]; then
    echo "   Frontend: http://localhost:$FRONTEND_PORT"
fi
echo ""
echo "🌐 Access Points (External - from your IP):"
echo "   Backend API: http://$EC2_IP:$BACKEND_PORT/api"
if [ "$DEPLOY_CHOICE" = "1" ]; then
    echo "   Frontend: http://$EC2_IP:$FRONTEND_PORT"
fi
echo ""
echo "🔧 For Multi-Site Setup:"
echo "   Copy ec2-main-nginx.conf to /etc/nginx/nginx.conf"
echo "   Your welding app will be accessible at: http://$EC2_IP/welding"
echo "   Your welding API will be accessible at: http://$EC2_IP/welding/api"
echo ""
echo "🌐 Update your EC2 security group to allow:"
echo "   - Port 80 (Main nginx - if using multi-site setup)"
echo "   - Port $BACKEND_PORT (Backend API)"
if [ "$DEPLOY_CHOICE" = "1" ]; then
    echo "   - Port $FRONTEND_PORT (Frontend)"
fi
echo "   - Port $DB_PORT (Database - optional, for direct access)"
echo ""
echo "🔧 Management Commands:"
if [ "$DEPLOY_CHOICE" = "1" ]; then
    echo "   View logs: docker compose logs -f"
    echo "   Stop services: docker compose down"
    echo "   Restart services: docker compose restart"
    echo "   Update: git pull && docker compose up -d --build"
else
    echo "   View logs: docker compose -f docker-compose.prod.yml logs -f"
    echo "   Stop services: docker compose -f docker-compose.prod.yml down"
    echo "   Restart services: docker compose -f docker-compose.prod.yml restart"
    echo "   Update: git pull && docker compose -f docker-compose.prod.yml up -d --build"
fi
echo ""
echo "📚 Next Steps:"
echo "   1. Test the app at http://$EC2_IP:$BACKEND_PORT/api/health"
if [ "$DEPLOY_CHOICE" = "1" ]; then
    echo "   2. Test frontend at http://$EC2_IP:$FRONTEND_PORT"
fi
echo "   3. Configure your main nginx for multi-site setup (optional)"
echo "   4. Set up monitoring and backups"
echo "   5. When you get a domain, update the nginx configs"