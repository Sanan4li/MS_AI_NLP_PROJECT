# Deployment Guide

## Pre-Deployment Checklist

### Backend
- [ ] Set `synchronize: false` in database config (use migrations instead)
- [ ] Configure production database credentials
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Set NODE_ENV=production
- [ ] Configure rate limiting
- [ ] Set up health check endpoints
- [ ] Review and harden CORS settings
- [ ] Enable compression

### Frontend
- [ ] Build optimized production bundle
- [ ] Configure production API URL
- [ ] Enable analytics (optional)
- [ ] Test responsive design
- [ ] Optimize images and assets
- [ ] Configure CDN (optional)

### Infrastructure
- [ ] PostgreSQL with pgvector installed
- [ ] SSL/TLS certificates
- [ ] Domain name configured
- [ ] Firewall rules configured
- [ ] Backup strategy in place
- [ ] Monitoring and alerting set up

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Setup PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install pgvector
cd /tmp
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Configure database
sudo -u postgres psql
CREATE DATABASE qa_system;
\c qa_system
CREATE EXTENSION vector;
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone <your-repo>
cd NLP_Project/backend

# Install dependencies
npm install --production

# Build
npm run build

# Set environment variables
export NODE_ENV=production
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_USER=postgres
export DATABASE_PASSWORD=<secure-password>
export DATABASE_NAME=qa_system
export OPENAI_API_KEY=<your-key>
export PORT=3000

# Run with PM2
npm install -g pm2
pm2 start dist/main.js --name qa-backend
pm2 save
pm2 startup
```

#### 3. Deploy Frontend

```bash
cd ../frontend

# Build
npm run build

# Serve with nginx or serve
npm install -g serve
pm2 start "serve -s dist -l 5173" --name qa-frontend
```

#### 4. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/qa-system
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/qa-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Docker Deployment

#### Create Dockerfiles

**backend/Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_DB: qa_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: postgres
      DATABASE_PASSWORD: ${DB_PASSWORD}
      DATABASE_NAME: qa_system
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
# Set environment variables
export DB_PASSWORD=secure_password
export OPENAI_API_KEY=your_key

# Build and run
docker-compose up -d

# Run data ingestion
docker-compose exec backend npm run ingest
```

### Option 3: Cloud Platform (Heroku, Railway, Render)

#### Render.com Example

1. **Create PostgreSQL Database**
   - Add pgvector extension in dashboard

2. **Deploy Backend**
   - Connect GitHub repo
   - Set environment variables
   - Deploy from `backend/` directory

3. **Deploy Frontend**
   - Connect GitHub repo
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set API URL environment variable

4. **Run Ingestion**
   - Use Render shell to run: `npm run ingest`

## Post-Deployment

### 1. Run Data Ingestion

```bash
# SSH into server
ssh user@yourserver.com

# Run ingestion
cd /path/to/backend
npm run ingest
```

### 2. Verify System

```bash
# Check backend health
curl https://yourdomain.com/api/qa/history

# Test question answering
curl -X POST https://yourdomain.com/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is machine learning?"}'
```

### 3. Monitor Logs

```bash
# PM2
pm2 logs qa-backend

# Docker
docker-compose logs -f backend

# System logs
tail -f /var/log/nginx/error.log
```

### 4. Set Up Monitoring

- **Application Performance**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Database Monitoring**: pgAdmin, built-in PostgreSQL stats

## Maintenance

### Database Backups

```bash
# Manual backup
pg_dump -U postgres qa_system > backup_$(date +%Y%m%d).sql

# Automated daily backups (crontab)
0 2 * * * pg_dump -U postgres qa_system > /backups/qa_$(date +\%Y\%m\%d).sql
```

### Update Documents

```bash
# Add new PDFs to data/ folder
# Re-run ingestion
npm run ingest
```

### Update Application

```bash
git pull origin main
cd backend
npm install
npm run build
pm2 restart qa-backend

cd ../frontend
npm install
npm run build
pm2 restart qa-frontend
```

## Troubleshooting

### High Memory Usage
- Increase server RAM
- Reduce batch size in ingestion
- Enable connection pooling

### Slow Queries
- Add database indexes
- Optimize chunk size
- Use query caching

### OpenAI Rate Limits
- Implement request queuing
- Add exponential backoff
- Consider caching embeddings

### Database Connection Errors
- Check connection pool settings
- Verify firewall rules
- Check database resource usage

## Security Best Practices

1. **Never commit .env files**
2. **Use strong database passwords**
3. **Rotate API keys regularly**
4. **Enable HTTPS only**
5. **Implement rate limiting**
6. **Regular security updates**
7. **Monitor for suspicious activity**
8. **Backup regularly**

## Cost Estimation

### OpenAI Costs (Approximate)
- **Ingestion**: $0.02 per 1000 chunks (text-embedding-3-small)
- **Questions**: $0.15 per 1M tokens (gpt-4o-mini)
- **Estimated**: ~$5-20/month for moderate usage

### Infrastructure Costs
- **VPS**: $5-20/month (DigitalOcean, Hetzner)
- **Managed Database**: $15-50/month
- **Total**: $20-70/month

## Support

For issues during deployment:
1. Check logs first
2. Verify environment variables
3. Test database connectivity
4. Review CORS settings
5. Check API rate limits

---

Good luck with your deployment! 🚀

