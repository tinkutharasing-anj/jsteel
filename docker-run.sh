#!/bin/bash

# Welding App Docker Runner Script
# This script provides easy options to run the welding app in Docker

set -e

echo "🔧 Welding App Docker Runner"
echo "=============================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  backend-only    Run only backend and database (for development)"
    echo "  full            Run complete app with frontend and nginx"
    echo "  standalone      Run standalone HTML form (no Docker needed)"
    echo "  stop            Stop all running containers"
    echo "  logs            Show logs from running containers"
    echo "  clean           Remove all containers and volumes"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backend-only    # Run backend API and database"
    echo "  $0 full            # Run complete app"
    echo "  $0 stop            # Stop all containers"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
}

# Function to run backend only
run_backend() {
    echo "🚀 Starting backend and database..."
    check_docker
    
    # Create uploads directory if it doesn't exist
    mkdir -p backend/uploads
    
    docker-compose up -d postgres backend
    
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    echo "✅ Backend is running!"
    echo "   📊 Database: http://localhost:5432"
    echo "   🔌 API: http://localhost:3001/api"
    echo "   📋 Health: http://localhost:3001/api/health"
    echo ""
    echo "💡 You can now run the frontend locally with: npm run web"
}

# Function to run full app
run_full() {
    echo "🚀 Starting complete welding app..."
    check_docker
    
    # Create uploads directory if it doesn't exist
    mkdir -p backend/uploads
    
    docker-compose -f docker-compose.full.yml up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 15
    
    echo "✅ Complete app is running!"
    echo "   📊 Database: http://localhost:5432"
    echo "   🔌 API: http://localhost:3001/api"
    echo "   🌐 Frontend: http://localhost:8080"
    echo "   🖥️  Nginx: http://localhost:80"
    echo "   📋 Health: http://localhost/health"
}

# Function to run standalone HTML form
run_standalone() {
    echo "🌐 Opening standalone HTML form..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open public/welding-inspection-form.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open > /dev/null; then
            xdg-open public/welding-inspection-form.html
        else
            echo "Please open public/welding-inspection-form.html in your browser"
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start public/welding-inspection-form.html
    else
        echo "Please open public/welding-inspection-form.html in your browser"
    fi
    
    echo "✅ Standalone form opened!"
    echo "   📄 File: public/welding-inspection-form.html"
    echo "   💡 No Docker needed - works in any browser!"
}

# Function to stop containers
stop_containers() {
    echo "🛑 Stopping all containers..."
    
    # Stop full compose if running
    if [ -f "docker-compose.full.yml" ]; then
        docker-compose -f docker-compose.full.yml down 2>/dev/null || true
    fi
    
    # Stop regular compose
    docker-compose down 2>/dev/null || true
    
    echo "✅ All containers stopped!"
}

# Function to show logs
show_logs() {
    echo "📋 Container logs:"
    echo ""
    
    # Show logs from running containers
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "welding_app"; then
        echo "🔌 Backend logs:"
        docker logs welding_app_backend --tail 20 2>/dev/null || echo "Backend not running"
        echo ""
        echo "🌐 Frontend logs:"
        docker logs welding_app_frontend --tail 20 2>/dev/null || echo "Frontend not running"
        echo ""
        echo "📊 Database logs:"
        docker logs welding_app_db --tail 20 2>/dev/null || echo "Database not running"
    else
        echo "No welding app containers are running."
        echo "Start them first with: $0 backend-only or $0 full"
    fi
}

# Function to clean up
clean_up() {
    echo "🧹 Cleaning up containers and volumes..."
    
    stop_containers
    
    # Remove volumes
    docker volume rm welding-app_postgres_data 2>/dev/null || true
    
    # Remove any remaining containers
    docker rm -f welding_app_db welding_app_backend welding_app_frontend welding_app_nginx 2>/dev/null || true
    
    echo "✅ Cleanup complete!"
}

# Main script logic
case "${1:-help}" in
    "backend-only")
        run_backend
        ;;
    "full")
        run_full
        ;;
    "standalone")
        run_standalone
        ;;
    "stop")
        stop_containers
        ;;
    "logs")
        show_logs
        ;;
    "clean")
        clean_up
        ;;
    "help"|*)
        show_usage
        ;;
esac


