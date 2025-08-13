# 🚀 Welding App EC2 Deployment Guide

This guide will help you deploy the welding app on your EC2 instance alongside your other websites.

## 📋 **Prerequisites**

- EC2 instance running Ubuntu/Debian or Amazon Linux
- Docker and Docker Compose installed
- Domain name pointing to your EC2 instance
- Basic knowledge of nginx and Docker

## 🏗️ **Architecture Overview**

```
Internet → EC2 Instance (Port 80/443) → Main Nginx → Welding App Services
                                    ↓
                              Other Sites
```

**Port Mapping:**
- **80/443**: Main nginx (your domain)
- **8081**: Welding frontend
- **3002**: Welding backend API
- **8082**: Welding nginx proxy
- **5433**: Welding database

## 🚀 **Quick Deployment**

### **1. Upload Files to EC2**

```bash
# On your local machine, zip the welding app
cd welding-app
zip -r welding-app-ec2.zip . -x "node_modules/*" ".git/*" "coverage/*" "test-results/*"

# Upload to EC2 (replace with your EC2 details)
scp -i your-key.pem welding-app-ec2.zip ubuntu@your-ec2-ip:/home/ubuntu/
```

### **2. On Your EC2 Instance**

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker if not already installed
sudo apt update
sudo apt install -y docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Extract the welding app
cd /home/ubuntu
unzip welding-app-ec2.zip -d welding-app
cd welding-app

# Make deployment script executable
chmod +x deploy-ec2.sh

# Run the deployment
./deploy-ec2.sh
```

## 🔧 **Manual Setup (Alternative)**

### **1. Create Environment File**

```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_very_secure_jwt_secret_here
REACT_APP_API_URL=http://your-ec2-public-ip:3002/api
EOF
```

### **2. Start Services**

```bash
# Start welding app services
docker compose -f docker-compose.ec2.yml up -d --build

# Check status
docker compose -f docker-compose.ec2.yml ps
```

### **3. Configure Main Nginx**

```bash
# Backup existing nginx config
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Copy our multi-site configuration
sudo cp ec2-main-nginx.conf /etc/nginx/nginx.conf

# Edit the config to match your domain
sudo nano /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 🌐 **Domain Configuration**

### **Option 1: Path-Based Routing (Recommended)**

Your welding app will be accessible at:
- **Main site**: `https://yourdomain.com`
- **Welding app**: `https://yourdomain.com/welding`
- **Welding API**: `https://yourdomain.com/welding/api`

### **Option 2: Subdomain Routing**

Your welding app will be accessible at:
- **Main site**: `https://yourdomain.com`
- **Welding app**: `https://welding.yourdomain.com`

## 🔒 **Security Configuration**

### **1. Update EC2 Security Group**

Allow these ports in your EC2 security group:
- **80**: HTTP (main nginx)
- **443**: HTTPS (main nginx)
- **22**: SSH (your access)

**Note**: The welding app ports (8081, 3002, 8082, 5433) are only accessible locally on the EC2 instance.

### **2. Environment Variables**

```bash
# Generate secure passwords
openssl rand -base64 32  # For DB_PASSWORD
openssl rand -base64 64  # For JWT_SECRET

# Update .env file
nano .env
```

### **3. Database Security**

```bash
# Change default database password
docker exec -it welding_app_db psql -U postgres -d welding_app
ALTER USER postgres PASSWORD 'your_new_secure_password';
\q

# Update .env file with new password
nano .env
```

## 📊 **Monitoring & Maintenance**

### **View Logs**

```bash
# All services
docker compose -f docker-compose.ec2.yml logs -f

# Specific service
docker logs welding_app_backend -f
docker logs welding_app_frontend -f
```

### **Health Checks**

```bash
# Main nginx
curl http://localhost/health

# Welding app
curl http://localhost:8081
curl http://localhost:3002/api/health
```

### **Updates**

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.ec2.yml down
docker compose -f docker-compose.ec2.yml up -d --build
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**

```bash
# Check what's using the port
sudo lsof -i :8081
sudo lsof -i :3002

# Kill the process
sudo kill -9 <PID>
```

#### **2. Docker Permission Issues**

```bash
# Fix docker permissions
sudo chmod 666 /var/run/docker.sock
sudo usermod -aG docker $USER
newgrp docker
```

#### **3. Nginx Configuration Errors**

```bash
# Test nginx config
sudo nginx -t

# Check nginx status
sudo systemctl status nginx
sudo journalctl -u nginx -f
```

#### **4. Database Connection Issues**

```bash
# Check database container
docker ps | grep postgres

# Check database logs
docker logs welding_app_db

# Test database connection
docker exec -it welding_app_db psql -U postgres -d welding_app -c "SELECT 1;"
```

### **Reset Everything**

```bash
# Stop all services
docker compose -f docker-compose.ec2.yml down

# Remove volumes
docker volume rm welding-app_welding_postgres_data

# Start fresh
./deploy-ec2.sh
```

## 🔄 **Integration with Other Sites**

### **1. Add More Sites to Main Nginx**

Edit `/etc/nginx/nginx.conf` and add more location blocks:

```nginx
# Your other site
location /othersite {
    proxy_pass http://127.0.0.1:8083;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# Another app
location /app2 {
    proxy_pass http://127.0.0.1:8084;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### **2. SSL/HTTPS Setup**

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📈 **Performance Optimization**

### **1. Resource Limits**

Add to `docker-compose.ec2.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 512M
      cpus: '0.25'
```

### **2. Nginx Caching**

```nginx
# Add to nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```

### **3. Database Optimization**

```bash
# Connect to database
docker exec -it welding_app_db psql -U postgres -d welding_app

# Create indexes for better performance
CREATE INDEX idx_welds_created_at ON welds(created_at);
CREATE INDEX idx_welds_project_id ON welds(project_id);
```

## 🎯 **Quick Commands Reference**

| Action | Command |
|--------|---------|
| Deploy | `./deploy-ec2.sh` |
| Start | `docker compose -f docker-compose.ec2.yml up -d` |
| Stop | `docker compose -f docker-compose.ec2.yml down` |
| Restart | `docker compose -f docker-compose.ec2.yml restart` |
| Logs | `docker compose -f docker-compose.ec2.yml logs -f` |
| Update | `git pull && docker compose -f docker-compose.ec2.yml up -d --build` |
| Status | `docker compose -f docker-compose.ec2.yml ps` |

## 🆘 **Need Help?**

If you encounter issues:

1. **Check logs**: `docker compose -f docker-compose.ec2.yml logs -f`
2. **Verify Docker**: `docker info`
3. **Check ports**: `sudo lsof -i :8081`
4. **Test nginx**: `sudo nginx -t`
5. **Restart services**: `docker compose -f docker-compose.ec2.yml restart`

## 🎉 **Success!**

Your welding app is now running on EC2 alongside your other sites! 

**Access URLs:**
- **Path-based**: `https://yourdomain.com/welding`
- **Subdomain**: `https://welding.yourdomain.com`

**Next Steps:**
1. Test all functionality
2. Set up SSL certificates
3. Configure monitoring
4. Set up backups
5. Document your setup
