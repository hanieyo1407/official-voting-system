# 🐳 Docker Setup for SJBU Voting System

## Overview

This guide explains how to containerize and deploy your SJBU Voting System using Docker and Docker Compose.

## 📋 Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (version 2.0 or later)
- Git

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voting App    │    │   PostgreSQL    │    │      Redis      │
│   (Node.js)     │◄──►│   Database      │    │     Cache       │
│   Port: 3000    │    │   Port: 5432    │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Nginx       │
                    │  Load Balancer  │
                    │  Port: 80/443   │
                    └─────────────────┘
```

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://avnadmin:your_password@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require
DB_PASSWORD=your_actual_password

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Optional: Redis Password
REDIS_PASSWORD=your_redis_password
```

### 2. Build and Run

```bash
# Build the application
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Access the Application

- **Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/v1/api-docs
- **Health Check**: http://localhost:3000/health

## 📁 File Structure

```
├── Dockerfile                 # Main application container
├── docker-compose.yml         # Development setup
├── docker-compose.prod.yml    # Production setup
├── .dockerignore             # Files to exclude from build
├── docker/
│   ├── Dockerfile.postgres   # Database container
│   └── nginx.conf           # Web server configuration
└── src/
    └── db/
        ├── migrations/       # Database migrations
        └── python_migrations/ # Python migration scripts
```

## 🔧 Configuration Options

### Development Mode

```bash
# Start with all services
docker-compose up

# Start specific services
docker-compose up postgres redis
docker-compose up voting-app

# View logs
docker-compose logs voting-app
docker-compose logs -f postgres
```

### Production Mode

```bash
# Build and deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# Scale the application
docker-compose -f docker-compose.prod.yml up -d --scale voting-app=3
```

## 🗄️ Database Management

### Database Migrations

The system automatically runs migrations when the database container starts:

```bash
# Check migration status
docker-compose exec postgres psql -U avnadmin -d sjbu_voting -c "\dt"

# Run manual migrations
docker-compose exec postgres psql -U avnadmin -d sjbu_voting -f /docker-entrypoint-initdb.d/004_add_election_management_tables.sql
```

### Database Backup

```bash
# Create backup from running container
docker-compose exec postgres pg_dump -U avnadmin sjbu_voting > backup_$(date +%Y%m%d_%H%M%S).sql

# Copy backup to host
docker cp $(docker-compose ps -q postgres):/backup.sql ./backups/
```

## 🔍 Monitoring and Debugging

### Health Checks

```bash
# Check all services health
docker-compose ps

# Check specific service logs
docker-compose logs voting-app
docker-compose logs postgres

# Enter container for debugging
docker-compose exec voting-app sh
docker-compose exec postgres psql -U avnadmin -d sjbu_voting
```

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using port 3000
   lsof -i :3000

   # Use different port
   PORT=3001 docker-compose up
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres

   # Test database connection
   docker-compose exec postgres pg_isready -U avnadmin
   ```

3. **Build Issues**
   ```bash
   # Clean and rebuild
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   ```

## 🚀 Production Deployment

### Environment Variables

Create a `.env.prod` file for production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://avnadmin:${DB_PASSWORD}@postgres:5432/sjbu_voting
JWT_SECRET=${JWT_SECRET}
REDIS_PASSWORD=${REDIS_PASSWORD}
```

### SSL Configuration (Optional)

1. **Generate SSL certificates**:
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout docker/ssl/key.pem -out docker/ssl/cert.pem -days 365 -nodes
   ```

2. **Uncomment HTTPS section** in `docker/nginx.conf`

3. **Update environment**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📊 Scaling

### Horizontal Scaling

```bash
# Scale the application to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale voting-app=3

# Check load balancer distribution
curl -H "Host: localhost" http://localhost:80/api/v1/positions
```

### Database Scaling

For high-traffic scenarios, consider:
- **Read replicas** for statistics queries
- **Connection pooling** with PgBouncer
- **Database sharding** for large user bases

## 🔒 Security Best Practices

### Container Security
- **Non-root user** in application container
- **Minimal base images** (Alpine Linux)
- **Security updates** for all images

### Network Security
- **Internal network** for service communication
- **No exposed database ports** in production
- **Rate limiting** at Nginx level

### Data Security
- **Encrypted database connections**
- **Secure credential management**
- **Regular backup encryption**

## 🛠️ Maintenance

### Updates

```bash
# Update application
git pull
docker-compose build
docker-compose up -d

# Update database
docker-compose exec postgres psql -U avnadmin -d sjbu_voting -f new_migration.sql
```

### Backup Strategy

```bash
# Automated daily backup
0 2 * * * docker-compose exec postgres pg_dump -U avnadmin sjbu_voting > /backups/backup_$(date +\%Y\%m\%d).sql

# Restore from backup
docker-compose exec -T postgres psql -U avnadmin -d sjbu_voting < backup.sql
```

## 📈 Performance Optimization

### Caching Strategy
- **Redis** for session storage and API caching
- **Application-level caching** for frequently accessed data
- **Database query optimization** with proper indexing

### Monitoring
- **Health checks** for all services
- **Resource monitoring** with Docker stats
- **Log aggregation** for troubleshooting

## 🚨 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   docker-compose logs [service-name]
   docker-compose ps
   ```

2. **Database connection failed**
   ```bash
   docker-compose exec postgres pg_isready
   docker-compose logs postgres
   ```

3. **Port already in use**
   ```bash
   docker-compose down
   docker system prune
   # Or use different ports in docker-compose.yml
   ```

4. **Memory issues**
   ```bash
   docker system df
   docker volume prune
   ```

## 🎯 API Endpoints Available

Once running, your API will be available at:

- **Main Application**: http://localhost:3000
- **API Base**: http://localhost:3000/api/v1/
- **API Documentation**: http://localhost:3000/api/v1/api-docs
- **Admin Panel**: http://localhost:3000/api/v1/admin/
- **Statistics**: http://localhost:3000/api/v1/stats/
- **Election Management**: http://localhost:3000/api/v1/election/
- **Runoff Elections**: http://localhost:3000/api/v1/runoff/

## 📞 Support

For issues with Docker deployment:

1. **Check logs**: `docker-compose logs [service]`
2. **Verify health**: `docker-compose ps`
3. **Test connectivity**: `curl http://localhost:3000/health`
4. **Database check**: `docker-compose exec postgres pg_isready`

---

**Your SJBU Voting System is now containerized and ready for deployment!** 🐳