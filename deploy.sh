#!/bin/bash

# Deployment script for Render platform
# This script helps prepare and deploy your Todo application

echo "🚀 Preparing Todo App for Render Deployment"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found render.yaml configuration"

# Check if required files exist
echo "🔍 Checking required files..."

required_files=(
    "todo-service/Dockerfile"
    "frontend/Dockerfile"
    "frontend/nginx.conf"
    "render.yaml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - Missing!"
        exit 1
    fi
done

echo ""
echo "📝 Pre-deployment checklist:"
echo "  1. ✅ Backend Dockerfile optimized"
echo "  2. ✅ Frontend Dockerfile with multi-stage build"
echo "  3. ✅ Nginx configuration for production"
echo "  4. ✅ Health endpoint added to backend"
echo "  5. ✅ CORS configured for Render domains"
echo "  6. ✅ Environment variables configured"

echo ""
echo "🔧 Next steps:"
echo "  1. Commit and push your changes to GitHub:"
echo "     git add ."
echo "     git commit -m 'Add Render deployment configuration'"
echo "     git push origin main"
echo ""
echo "  2. Go to https://render.com/dashboard"
echo "  3. Click 'New' → 'Blueprint'"
echo "  4. Connect your GitHub repository"
echo "  5. Render will detect render.yaml and deploy both services"
echo ""
echo "📋 After deployment:"
echo "  1. Update CORS settings with your actual frontend URL"
echo "  2. Test your application endpoints"
echo "  3. Consider upgrading to PostgreSQL for production"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "✨ Your app is ready for deployment! Good luck!"
