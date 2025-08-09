# Deployment Guide for Render Platform

This guide will help you deploy your Todo application on Render using Docker.

## Prerequisites

1. A GitHub account with your code repository
2. A Render account (sign up at https://render.com)
3. Your repository should be public or you need to grant Render access to your private repo

## Project Structure

Your project is now configured with:
- ✅ **Backend Dockerfile** (`todo-service/Dockerfile`) - Optimized Go service
- ✅ **Frontend Dockerfile** (`frontend/Dockerfile`) - Multi-stage React build with Nginx
- ✅ **Nginx Configuration** (`frontend/nginx.conf`) - Production-ready web server config
- ✅ **Render Configuration** (`render.yaml`) - Infrastructure as Code for Render
- ✅ **Health Endpoint** - Added `/health` endpoint for backend monitoring
- ✅ **CORS Configuration** - Updated to work with Render domains

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com/dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository and branch (main)
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy both services

### Option 2: Manual Deployment

If you prefer to deploy services individually:

#### Backend Service:
1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `todo-backend`
   - Runtime: `Docker`
   - Dockerfile Path: `./todo-service/Dockerfile`
   - Docker Context: `./todo-service`
   - Branch: `main`
4. Environment Variables:
   - `PORT`: `8080`
   - `GIN_MODE`: `release`
5. Health Check Path: `/health`
6. Click "Create Web Service"

#### Frontend Service:
1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `todo-frontend`
   - Runtime: `Docker`
   - Dockerfile Path: `./frontend/Dockerfile`
   - Docker Context: `./frontend`
   - Branch: `main`
4. Docker Build Arguments:
   - `REACT_APP_API_URL`: `https://todo-backend.onrender.com` (replace with your actual backend URL)
5. Health Check Path: `/`
6. Click "Create Web Service"

## Post-Deployment Configuration

### 1. Update CORS Settings
After deployment, update the CORS configuration in `todo-service/routes.go` with your actual frontend URL:

```go
if origin == "http://localhost:3000" || 
   origin == "https://todo-frontend.onrender.com" || // Replace with your actual frontend URL
   origin != "" {
```

### 2. Database Considerations
Your current setup uses SQLite which will work but has limitations on Render:
- SQLite data will be lost when the service restarts
- Consider upgrading to PostgreSQL for production

To add PostgreSQL:
1. In Render Dashboard → "New" → "PostgreSQL"
2. Create a database
3. Update your Go code to use PostgreSQL connection string from environment variables

### 3. Environment Variables
Make sure to set any additional environment variables your application needs:
- Database connection strings
- API keys
- JWT secrets (if used)

## Service URLs

After deployment, your services will be available at:
- **Backend**: `https://todo-backend.onrender.com`
- **Frontend**: `https://todo-frontend.onrender.com`

## Monitoring and Logs

- View logs in Render Dashboard → Your Service → Logs
- Monitor health status in the service overview
- Set up alerts for service failures

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Docker build logs in Render dashboard
   - Ensure all dependencies are properly listed in `package.json`/`go.mod`

2. **CORS Errors:**
   - Verify frontend URL is added to CORS configuration
   - Check that credentials are properly configured

3. **API Connection Issues:**
   - Ensure `REACT_APP_API_URL` is set correctly
   - Verify backend service is running and accessible

4. **Database Connection Issues:**
   - Check SQLite file permissions
   - Consider migrating to PostgreSQL for better reliability

### Useful Commands:

```bash
# View your deployed services
render services list

# Check service logs
render logs <service-name>

# Force redeploy
render deploy <service-name>
```

## Next Steps

1. **Custom Domain:** Configure custom domains in Render settings
2. **SSL Certificates:** Render provides free SSL certificates automatically
3. **Environment Management:** Set up different environments (staging, production)
4. **Database Migration:** Consider moving to PostgreSQL for production use
5. **Monitoring:** Set up application monitoring and alerting

## Cost Considerations

- Render free tier includes:
  - 750 hours/month of running time for web services
  - 100GB bandwidth/month
  - Services sleep after 15 minutes of inactivity
  
- For production use, consider upgrading to paid plans for:
  - Always-on services
  - More resources
  - Priority support

Your application is now ready for deployment on Render! 🚀
