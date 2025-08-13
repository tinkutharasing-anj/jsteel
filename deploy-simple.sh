#!/bin/bash

echo "🚀 Simple Welding App Deployment"
echo "================================"

# Get EC2 IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
echo "🌐 EC2 IP: $EC2_IP"

# Create .env file line by line
echo "📝 Creating .env file..."
echo "NODE_ENV=production" > .env
echo "DB_PASSWORD=postgres123" >> .env
echo "JWT_SECRET=your_jwt_secret_here_change_in_production" >> .env
echo "REACT_APP_API_URL=http://$EC2_IP:3002/api" >> .env

echo "✅ .env file created"

# Start services
echo "🚀 Starting services..."
docker compose -f docker-compose.ec2.yml up -d --build

echo "⏳ Waiting for services to start..."
sleep 20

# Check status
echo "📊 Service status:"
docker compose -f docker-compose.ec2.yml ps

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Access your app at: http://$EC2_IP:8081"
echo "🔌 API at: http://$EC2_IP:3002/api"
echo "🌐 Nginx proxy at: http://$EC2_IP:8082"
