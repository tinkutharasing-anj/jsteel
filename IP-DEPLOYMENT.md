# 🌐 Welding App EC2 Deployment - IP-Based Access

This guide shows you how to deploy the welding app on your EC2 instance using just the IP address, no domain required!

## 🚀 **Quick Start (IP-Only)**

### **1. Upload to EC2**

```bash
# On your local machine
cd welding-app
zip -r welding-app-ec2.zip . -x "node_modules/*" ".git/*" "coverage/*" "test-results/*"

# Upload to EC2 (replace with your details)
scp -i your-key.pem welding-app-ec2.zip ubuntu@your-ec2-ip:/home/ubuntu/
```

### **2. Deploy on EC2**

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker (if needed)
sudo apt update && sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker

# Extract and deploy
cd /home/ubuntu
unzip welding-app-ec2.zip -d welding-app
cd welding-app
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

## 📱 **Access Your App**

After deployment, your welding app will be accessible at:

- **Frontend**: `http://YOUR-EC2-IP:8081`
- **Backend API**: `http://YOUR-EC2-IP:3002/api`
- **Nginx Proxy**: `http://YOUR-EC2-IP:8082`

## 🔧 **EC2 Security Group Setup**

Update your EC2 security group to allow these ports:

| Port | Purpose | Access |
|------|---------|---------|
| 8081 | Frontend | Public |
| 3002 | Backend API | Public |
| 8082 | Nginx Proxy | Public |
| 5433 | Database | Private (optional) |

## 🎯 **Two Access Methods**

### **Method 1: Direct Port Access (Simplest)**

Access each service directly on its port:
- Frontend: `http://YOUR-EC2-IP:8081`
- API: `http://YOUR-EC2-IP:3002/api`

### **Method 2: Multi-Site Setup (Recommended)**

Set up a main nginx to route traffic:

```bash
# Copy the multi-site config
sudo cp ec2-main-nginx.conf /etc/nginx/nginx.conf

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

Then access at:
- **Welding App**: `http://YOUR-EC2-IP/welding`
- **Welding API**: `http://YOUR-EC2-IP/welding/api`

## 🔒 **Security Setup**

### **1. Generate Secure Passwords**

```bash
# Generate secure passwords
openssl rand -base64 32  # For database
openssl rand -base64 64  # For JWT

# Update .env file
nano .env
```

### **2. Update .env File**

```bash
NODE_ENV=production
DB_PASSWORD=your_generated_db_password
JWT_SECRET=your_generated_jwt_secret
REACT_APP_API_URL=http://YOUR-EC2-IP:3002/api
```

## 📊 **Testing Your Deployment**

### **Health Checks**

```bash
# Test API
curl http://YOUR-EC2-IP:3002/api/health

# Test Frontend
curl http://YOUR-EC2-IP:8081

# Test Nginx
curl http://YOUR-EC2-IP:8082
```

### **Browser Testing**

1. Open `http://YOUR-EC2-IP:8081` in your browser
2. Test the welding app functionality
3. Check that images upload correctly
4. Verify API calls work

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Port Not Accessible**
```bash
# Check if service is running
docker compose -f docker-compose.ec2.yml ps

# Check security group settings
# Verify port is open in EC2 security group
```

#### **Service Not Starting**
```bash
# View logs
docker compose -f docker-compose.ec2.yml logs -f

# Restart services
docker compose -f docker-compose.ec2.yml restart
```

#### **Database Issues**
```bash
# Check database container
docker logs welding_app_db

# Test connection
docker exec -it welding_app_db psql -U postgres -d welding_app -c "SELECT 1;"
```

## 🔄 **Updates & Maintenance**

### **Update the App**

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.ec2.yml down
docker compose -f docker-compose.ec2.yml up -d --build
```

### **View Logs**

```bash
# All services
docker compose -f docker-compose.ec2.yml logs -f

# Specific service
docker logs welding_app_backend -f
```

### **Stop/Start**

```bash
# Stop all services
docker compose -f docker-compose.ec2.yml down

# Start all services
docker compose -f docker-compose.ec2.yml up -d
```

## 🌟 **When You Get a Domain Later**

1. **Update nginx configs** with your domain name
2. **Set up SSL certificates** with Let's Encrypt
3. **Update .env file** with domain-based URLs
4. **Configure DNS** to point to your EC2 IP

## 🎉 **You're All Set!**

Your welding app is now running on EC2 and accessible via IP address!

**Quick Access:**
- **App**: `http://YOUR-EC2-IP:8081`
- **API**: `http://YOUR-EC2-IP:3002/api`

**Next Steps:**
1. Test all functionality
2. Set up monitoring
3. Configure backups
4. Get a domain when ready
5. Set up SSL/HTTPS
