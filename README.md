# SocialConnect - Production-Ready Social Media Platform

A full-stack social media application with real-time messaging, built with React, Node.js, PostgreSQL, and Socket.IO.

## Features

✅ **Authentication**
- Email/password signup and login
- JWT access & refresh tokens
- Secure password hashing with bcrypt
- Protected routes

✅ **Social Feed**
- Create, edit, and delete posts
- Like and comment system
- Real-time feed updates
- Pagination support

✅ **Real-Time Messaging**
- One-to-one private chats
- Real-time message delivery
- Typing indicators
- Read receipts
- Message editing
- Emoji reactions
- **Telegram-style "Delete for Everyone"** - Either user can permanently delete entire conversations

✅ **Production Ready**
- Dockerized deployment
- PostgreSQL database
- NGINX reverse proxy
- Health checks
- Security headers
- Gzip compression

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- Socket.IO
- JWT (jsonwebtoken)
- bcrypt

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Socket.IO Client
- Axios
- React Router v6

### Infrastructure
- Docker & Docker Compose
- NGINX
- PostgreSQL 15

## Project Structure

```
socialconnect/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/          # API routes
│   │   │   ├── controllers/     # Request handlers
│   │   │   ├── middlewares/     # Auth, error handling
│   │   │   └── validators/      # Input validation
│   │   ├── services/            # Business logic
│   │   ├── socket/              # WebSocket handlers
│   │   ├── config/              # Configuration
│   │   ├── utils/               # Utilities
│   │   ├── app.ts               # Express app
│   │   └── server.ts            # Server entry
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── features/                # Feature modules
│   ├── components/              # Reusable components
│   ├── services/                # API & Socket clients
│   ├── store/                   # Zustand stores
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start - Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (or use Docker)

### 1. Clone Repository
```bash
git clone <repository-url>
cd socialconnect
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://socialapp:changeMe123!@localhost:5432/socialconnect"
PORT=3001
NODE_ENV=development
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
EOF

# Run database migrations
npx prisma migrate dev

# Start backend
npm run dev
```

### 3. Setup Frontend
```bash
cd ../
npm install

# Start frontend
npm run dev
```

Access the app at: http://localhost:3000

## Docker Deployment

### Local Docker Setup

1. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your values
```

2. **Build and start all services:**
```bash
docker compose up -d --build
```

3. **Check service health:**
```bash
docker compose ps
docker compose logs -f
```

4. **Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:3001
- Database: localhost:5432

5. **Stop services:**
```bash
docker compose down
```

6. **Remove all data:**
```bash
docker compose down -v
```

## Hostinger VPS Deployment

### Step 1: VPS Setup

1. **Create VPS on Hostinger:**
   - Go to Hostinger control panel
   - Create a new VPS (minimum 2GB RAM recommended)
   - Note your VPS IP address

2. **Enable Docker Manager:**
   - In Hostinger VPS panel, enable Docker Manager
   - Or SSH into VPS and install Docker manually:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

3. **Install Docker Compose:**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Open Required Ports:**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

### Step 2: Initial Deployment

1. **SSH into your VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Clone repository:**
   ```bash
   git clone <your-repo-url>
   cd socialconnect
   ```

3. **Create production environment file:**
   ```bash
   nano .env
   ```
   
   Add these values (CHANGE THE SECRETS!):
   ```env
   # Database
   POSTGRES_USER=socialapp
   POSTGRES_PASSWORD=StrongPassword123!
   POSTGRES_DB=socialconnect
   
   # JWT Secrets - GENERATE NEW ONES!
   JWT_ACCESS_SECRET=generate-a-super-long-random-string-here-at-least-32-chars
   JWT_REFRESH_SECRET=another-super-long-random-string-different-from-above
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   
   # URLs
   CORS_ORIGIN=http://your-vps-ip
   FRONTEND_URL=http://your-vps-ip
   ```

4. **Build and start:**
   ```bash
   docker compose up -d --build
   ```

5. **Verify deployment:**
   ```bash
   docker compose ps
   docker compose logs -f
   ```

6. **Access your app:**
   - Open browser: `http://your-vps-ip`

### Step 3: Updates / Refresh Workflow

Whenever you make changes and push to GitHub:

1. **SSH into VPS:**
   ```bash
   ssh root@your-vps-ip
   cd socialconnect
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

3. **Rebuild and restart:**
   ```bash
   docker compose down
   docker compose up -d --build
   ```

4. **Verify:**
   ```bash
   docker compose logs -f
   ```

### Step 4: SSL/HTTPS Setup (Optional but Recommended)

1. **Install Certbot:**
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Update docker-compose.yml ports:**
   ```yaml
   frontend:
     ports:
       - "80:80"
       - "443:443"
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | `random-32-char-string` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `another-random-string` |
| `POSTGRES_USER` | Database username | `socialapp` |
| `POSTGRES_PASSWORD` | Database password | `StrongPassword123!` |
| `POSTGRES_DB` | Database name | `socialconnect` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend port |
| `NODE_ENV` | `development` | Environment |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token expiry |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origin |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Toggle like
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:postId/comments/:commentId` - Delete comment

### Messages
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/conversations` - Create conversation
- `DELETE /api/conversations/:id` - Delete for everyone

### WebSocket Events
- `message:send` - Send new message
- `message:edit` - Edit message
- `message:delete` - Delete message
- `message:react` - Add/remove reaction
- `conversation:delete` - Delete conversation
- `typing:start` - User typing
- `typing:stop` - User stopped typing

## Database Schema

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  name          String
  createdAt     DateTime       @default(now())
  posts         Post[]
  conversations Conversation[]
  messages      Message[]
}

model Post {
  id        String    @id @default(uuid())
  content   String
  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
  likes     Like[]
  comments  Comment[]
  createdAt DateTime  @default(now())
}

model Conversation {
  id             String    @id @default(uuid())
  participants   User[]
  messages       Message[]
  lastMessageAt  DateTime  @default(now())
}

model Message {
  id             String       @id @default(uuid())
  content        String
  senderId       String
  conversationId String
  reactions      Reaction[]
  createdAt      DateTime     @default(now())
  isEdited       Boolean      @default(false)
}
```

## Security Features

✅ Password hashing with bcrypt  
✅ JWT authentication with refresh tokens  
✅ Input validation and sanitization  
✅ SQL injection protection (Prisma)  
✅ XSS protection headers  
✅ CORS configuration  
✅ Rate limiting ready  
✅ Environment variable secrets  

## Troubleshooting

### Common Issues

**Backend not starting:**
```bash
# Check logs
docker compose logs backend

# Common fix: database not ready
docker compose restart backend
```

**Frontend not loading:**
```bash
# Check nginx logs
docker compose logs frontend

# Rebuild frontend
docker compose up -d --build frontend
```

**Database connection errors:**
```bash
# Check database is running
docker compose ps postgres

# Check connection string in .env
echo $DATABASE_URL
```

**Port already in use:**
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :3001

# Kill process or change port in docker-compose.yml
```

## Development Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npx prisma studio    # Open database GUI
npx prisma migrate dev --name migration_name  # Create migration

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Docker
docker compose up -d --build  # Build and start all services
docker compose down           # Stop all services
docker compose logs -f        # View logs
docker compose ps             # Check service status
docker compose restart <service>  # Restart specific service
```

## Performance Optimization

- ✅ Gzip compression enabled
- ✅ Static asset caching (1 year)
- ✅ Database indexes on foreign keys
- ✅ Connection pooling
- ✅ Nginx reverse proxy
- ✅ Production build optimization

## License

MIT

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

Built with ❤️ using React, Node.js, PostgreSQL, and Socket.IO
