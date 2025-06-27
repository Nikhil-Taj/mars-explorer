#!/bin/bash

# Mars Explorer Deployment Helper Script
# This script helps prepare your application for deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git from https://git-scm.com/"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed!"
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed!"
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    if [ -d "backend" ]; then
        print_status "Running backend tests..."
        cd backend
        if npm run test:ci; then
            print_success "Backend tests passed!"
        else
            print_warning "Backend tests failed or not configured"
        fi
        cd ..
    fi
    
    # Frontend tests
    if [ -d "frontend" ]; then
        print_status "Running frontend tests..."
        cd frontend
        if npm run test:ci; then
            print_success "Frontend tests passed!"
        else
            print_warning "Frontend tests failed or not configured"
        fi
        cd ..
    fi
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    if [ -d "backend" ]; then
        print_status "Building backend..."
        cd backend
        npm run build
        print_success "Backend built successfully!"
        cd ..
    fi
    
    # Build frontend
    if [ -d "frontend" ]; then
        print_status "Building frontend..."
        cd frontend
        npm run build
        print_success "Frontend built successfully!"
        cd ..
    fi
}

# Check environment files
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f "backend/.env.example" ]; then
        print_warning "Backend .env.example not found"
    else
        print_success "Backend .env.example found"
    fi
    
    if [ ! -f "frontend/.env.example" ]; then
        print_warning "Frontend .env.example not found"
    else
        print_success "Frontend .env.example found"
    fi
    
    print_warning "Remember to set up environment variables in your deployment platforms!"
}

# Git status check
check_git_status() {
    print_status "Checking Git status..."
    
    if [ -d ".git" ]; then
        if [ -n "$(git status --porcelain)" ]; then
            print_warning "You have uncommitted changes. Consider committing them before deployment."
            git status --short
        else
            print_success "Git working directory is clean"
        fi
        
        # Check if we're on main/master branch
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
            print_warning "You're not on main/master branch. Current branch: $CURRENT_BRANCH"
        fi
    else
        print_warning "Not a Git repository. Make sure to initialize Git and push to GitHub for deployment."
    fi
}

# Main deployment preparation
main() {
    echo "🚀 Mars Explorer Deployment Preparation"
    echo "======================================"
    echo ""
    
    check_prerequisites
    echo ""
    
    install_dependencies
    echo ""
    
    run_tests
    echo ""
    
    build_applications
    echo ""
    
    check_environment
    echo ""
    
    check_git_status
    echo ""
    
    print_success "🎉 Deployment preparation complete!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub if you haven't already"
    echo "2. Follow the deployment guide in DEPLOYMENT.md"
    echo "3. Set up your backend on Render"
    echo "4. Set up your frontend on Vercel"
    echo "5. Configure environment variables"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
    echo "📋 Use DEPLOYMENT_CHECKLIST.md to track your progress"
}

# Run main function
main
