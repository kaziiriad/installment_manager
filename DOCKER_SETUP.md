# Docker Setup Guide

This project uses Docker and Docker Compose to run all services.

## Services

- **frontend**: React application served by nginx (port 80)
- **web**: FastAPI backend application (port 8000)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache and queue (port 6379)
- **worker**: Celery worker for background tasks
- **beat**: Celery beat for scheduled tasks

## Prerequisites

- Docker
- Docker Compose
- `.env` file in the root directory (copy from `.env.example` if available)

## Running the Application

### Production Mode

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### Development Mode

For development with hot-reloading:

```bash
# Use the development override file
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Frontend will be available at http://localhost:5173
# Backend API will be available at http://localhost:8000
```

## Accessing the Application

- Frontend: http://localhost (production) or http://localhost:5173 (development)
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Environment Variables

The frontend build requires:
- `VITE_API_URL`: The URL of the backend API (default: http://localhost:8000)

The backend requires various environment variables defined in `.env`.

## Troubleshooting

### Port conflicts
If you get port binding errors:
```bash
# Check what's using the ports
lsof -i :80
lsof -i :8000
lsof -i :5432
lsof -i :6379

# Or on Windows
netstat -ano | findstr :80
```

### Frontend not connecting to backend
- Ensure the `VITE_API_URL` is correct
- Check that the backend service is running: `docker-compose ps`
- Check backend logs: `docker-compose logs web`

### Database connection issues
- Ensure PostgreSQL is running: `docker-compose ps postgres`
- Check environment variables in `.env`
- Check database logs: `docker-compose logs postgres`

## Building for Production

The production build uses multi-stage Docker builds:
1. Node.js stage builds the React application
2. Nginx stage serves the static files

The nginx configuration includes:
- Gzip compression
- Cache headers for static assets
- API proxy to the backend
- Security headers
- React Router support

## Development Tips

1. Use `docker-compose logs -f [service]` to follow logs for a specific service
2. Use `docker-compose exec web bash` to get a shell in the backend container
3. Use `docker-compose restart [service]` to restart a specific service
4. The frontend node_modules are volume-mounted to avoid rebuilding on dependency changes