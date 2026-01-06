# Deployment Guide for www.hfbworks.com

## What Was Fixed

✅ **Docker Deployment Error Fixed**
- Updated frontend Dockerfile to correctly reference `frontend/nginx.conf` from root build context
- The error was: `"/nginx.conf": not found` at line 22 of frontend/Dockerfile

✅ **Domain Configuration**
- Configured nginx to serve on `www.hfbworks.com` and `hfbworks.com`
- Updated default CORS and frontend URLs to `https://www.hfbworks.com`
- Added production environment example file

## Deployment Steps

### 1. On Your Docker Manager Server

Pull the latest code:
```bash
git pull origin main
```

### 2. Create Production Environment File

```bash
cp .env.production.example .env
```

Then edit `.env` and update these critical values:
- `POSTGRES_PASSWORD` - Use a strong password
- `JWT_ACCESS_SECRET` - Generate a random 64-character string
- `JWT_REFRESH_SECRET` - Generate a different random 64-character string

Generate secure secrets with:
```bash
openssl rand -hex 32
```

### 3. Deploy with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the frontend and backend containers
- Start PostgreSQL database
- Run database migrations
- Start all services

### 4. DNS Configuration

Point your domain to your server:

**A Records:**
- `hfbworks.com` → Your Server IP
- `www.hfbworks.com` → Your Server IP

### 5. SSL/HTTPS Setup (Recommended)

For production with HTTPS, you have two options:

#### Option A: Use Cloudflare (Easiest)
1. Add your domain to Cloudflare
2. Enable "Flexible" or "Full" SSL
3. Cloudflare will handle SSL certificates automatically

#### Option B: Use Let's Encrypt with Certbot
1. Install certbot on your server
2. Get certificates:
```bash
sudo certbot certonly --standalone -d www.hfbworks.com -d hfbworks.com
```
3. Update docker-compose.yml to expose port 443
4. Update nginx.conf to listen on 443 and include SSL certificates

### 6. Verify Deployment

Check services are running:
```bash
docker-compose ps
```

Check backend health:
```bash
curl http://localhost:3001/api/health
```

Check frontend:
```bash
curl http://localhost/
```

### 7. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Troubleshooting

### Backend won't start
- Check database connection: `docker-compose logs postgres`
- Verify DATABASE_URL is correct in .env
- Check migrations: `docker-compose exec backend npx prisma migrate deploy`

### Frontend shows blank page
- Check nginx logs: `docker-compose logs frontend`
- Verify backend is running: `docker-compose ps backend`

### CORS errors
- Update CORS_ORIGIN in .env to match your domain
- Restart backend: `docker-compose restart backend`

## Repository

GitHub: https://github.com/HFBworks/socialconnect

## Ports

- **80**: Frontend (HTTP)
- **3001**: Backend API (internal)
- **5432**: PostgreSQL (internal)

The frontend acts as a reverse proxy, so only port 80 needs to be exposed publicly.
