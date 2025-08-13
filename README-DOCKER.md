# 🐳 Welding App Docker Guide

## Quick Start

The welding app is fully containerized and ready to run in Docker! Here are your options:

### 🚀 **Option 1: Backend Only (Recommended for Development)**
```bash
./docker-run.sh backend-only
```
- Runs PostgreSQL database + Node.js backend API
- Frontend runs locally with `npm run web`
- Perfect for development and testing

### 🌐 **Option 2: Complete App (Production Ready)**
```bash
./docker-run.sh full
```
- Runs everything: Database + Backend + Frontend + Nginx
- Production-ready with load balancing and security
- Access via http://localhost:80

### 📄 **Option 3: Standalone HTML Form (No Docker)**
```bash
./docker-run.sh standalone
```
- Opens the comprehensive inspection form in your browser
- No Docker needed - works immediately
- Perfect for quick testing or offline use

## 🛠️ **Prerequisites**

1. **Docker Desktop** installed and running
2. **Git** for cloning the repository
3. **Node.js** (only if running frontend locally)

## 📁 **File Structure**

```
welding-app/
├── docker-compose.yml           # Backend + Database
├── docker-compose.full.yml      # Complete app (Backend + Frontend + Nginx)
├── Dockerfile                   # Frontend container
├── backend/Dockerfile           # Backend container
├── nginx.conf                   # Nginx configuration
├── docker-run.sh                # Easy runner script
└── public/
    └── welding-inspection-form.html  # Standalone form
```

## 🚀 **Running the App**

### **1. Backend Only (Development)**
```bash
# Start backend and database
./docker-run.sh backend-only

# In another terminal, run frontend locally
npm install
npm run web
```

**Access Points:**
- 🔌 **API**: http://localhost:3001/api
- 📊 **Database**: localhost:5432
- 📋 **Health Check**: http://localhost:3001/api/health

### **2. Complete App (Production)**
```bash
# Start everything
./docker-run.sh full

# Wait for services to start (about 15 seconds)
```

**Access Points:**
- 🌐 **Main App**: http://localhost:80
- 🔌 **API**: http://localhost:3001/api
- 📊 **Database**: localhost:5432
- 📋 **Health**: http://localhost/health

### **3. Standalone Form**
```bash
# Open in browser (no Docker needed)
./docker-run.sh standalone
```

## 🛑 **Managing Containers**

### **Stop All Services**
```bash
./docker-run.sh stop
```

### **View Logs**
```bash
./docker-run.sh logs
```

### **Clean Up Everything**
```bash
./docker-run.sh clean
```

### **Manual Docker Commands**
```bash
# Start backend only
docker-compose up -d

# Start complete app
docker-compose -f docker-compose.full.yml up -d

# Stop services
docker-compose down

# View running containers
docker ps

# View logs
docker logs welding_app_backend
```

## 🔧 **Configuration**

### **Environment Variables**
The app uses these environment variables (set in docker-compose files):

```yaml
# Database
POSTGRES_DB: welding_app
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres123

# Backend
PORT: 3001
NODE_ENV: development
JWT_SECRET: your_jwt_secret_here_change_in_production

# Frontend
REACT_APP_API_URL: http://localhost:3001/api
```

### **Ports**
- **80**: Nginx (main app)
- **3001**: Backend API
- **5432**: PostgreSQL database
- **8080**: Frontend (when running locally)

## 📊 **Database Setup**

The database is automatically initialized with:
- ✅ **Updated schema** with 69+ fields
- ✅ **Field definitions** for the comprehensive form
- ✅ **Sample data** (if provided)

### **Database Access**
```bash
# Connect to database
docker exec -it welding_app_db psql -U postgres -d welding_app

# View tables
\dt

# View field definitions
SELECT * FROM field_definitions ORDER BY field_order;
```

## 🖼️ **Image Uploads**

Image uploads are stored in `backend/uploads/` and served via:
- **Backend**: http://localhost:3001/uploads/
- **Nginx**: http://localhost/uploads/

### **Upload Directory**
```bash
# Create uploads directory
mkdir -p backend/uploads

# Set permissions (if needed)
chmod 755 backend/uploads
```

## 🔒 **Security Features**

### **Nginx Security Headers**
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

### **Rate Limiting**
- API: 10 requests/second
- Login: 5 requests/second

### **File Upload Security**
- File type validation
- Size limits (5MB)
- Executable file blocking

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Check what's using the port
lsof -ti:3001

# Kill the process
kill -9 <PID>
```

#### **2. Database Connection Failed**
```bash
# Check if database is running
docker ps | grep postgres

# Check database logs
docker logs welding_app_db
```

#### **3. Frontend Not Loading**
```bash
# Check frontend container
docker logs welding_app_frontend

# Verify API is accessible
curl http://localhost:3001/api/health
```

#### **4. Permission Denied on Script**
```bash
# Make script executable
chmod +x docker-run.sh
```

### **Reset Everything**
```bash
# Stop and remove everything
./docker-run.sh clean

# Start fresh
./docker-run.sh backend-only
```

## 📈 **Performance & Scaling**

### **Resource Limits**
```yaml
# Add to docker-compose files for production
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 512M
      cpus: '0.25'
```

### **Database Optimization**
- Connection pooling enabled
- Health checks implemented
- Automatic restart on failure

### **Nginx Optimization**
- Gzip compression enabled
- Static file caching
- Load balancing ready

## 🌍 **Production Deployment**

### **1. Environment Variables**
```bash
# Create .env file
cp .env.example .env

# Update with production values
JWT_SECRET=your_very_secure_secret_here
NODE_ENV=production
DB_PASSWORD=your_secure_db_password
```

### **2. SSL/HTTPS**
```bash
# Generate SSL certificates
# Update nginx.conf with SSL configuration
# Uncomment HTTPS server block
```

### **3. Monitoring**
```bash
# Add monitoring containers
docker run -d --name monitoring \
  -p 9090:9090 \
  prom/prometheus
```

## 📚 **Additional Resources**

### **Docker Commands Reference**
```bash
# Build images
docker-compose build

# View resource usage
docker stats

# Execute commands in containers
docker exec -it welding_app_backend sh

# Copy files to/from containers
docker cp welding_app_backend:/app/logs ./local-logs
```

### **Development Workflow**
1. **Start backend**: `./docker-run.sh backend-only`
2. **Run frontend locally**: `npm run web`
3. **Make changes** to code
4. **Restart backend** if needed: `docker restart welding_app_backend`
5. **Frontend auto-reloads** with changes

### **Testing**
```bash
# Run tests in container
docker exec -it welding_app_backend npm test

# Run E2E tests
docker exec -it welding_app_frontend npm run e2e
```

## 🎯 **Quick Commands Summary**

| Action | Command |
|--------|---------|
| Start Backend | `./docker-run.sh backend-only` |
| Start Full App | `./docker-run.sh full` |
| Open Form | `./docker-run.sh standalone` |
| Stop All | `./docker-run.sh stop` |
| View Logs | `./docker-run.sh logs` |
| Clean Up | `./docker-run.sh clean` |
| Help | `./docker-run.sh help` |

## 🆘 **Need Help?**

If you encounter issues:

1. **Check logs**: `./docker-run.sh logs`
2. **Verify Docker**: `docker info`
3. **Check ports**: `lsof -ti:3001`
4. **Restart services**: `./docker-run.sh stop && ./docker-run.sh backend-only`

The welding app is now fully containerized and ready for both development and production use! 🎉


