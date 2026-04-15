# Deployment Guide

This guide covers multiple deployment options for the ZeroHeart Resume Builder.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Docker Deployment](#docker-deployment)
- [Manual Server Deployment](#manual-server-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment Checklist](#post-deployment-checklist)

## Prerequisites

Before deploying, ensure you have:

- Node.js >= 18
- npm or yarn
- At least one AI API key (see Environment Variables section)
- Git repository (for Vercel/GitHub Actions deployment)

## Vercel Deployment (Recommended)

Vercel is the recommended hosting platform for Next.js applications.

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required keys (see below)
6. Click "Deploy"

### Configuration

The project includes `vercel.json` with optimal settings:

- **Region**: Hong Kong (`hnd1`) for better Asian access
- **CORS**: Configured for API routes
- **Build**: Automatic Next.js build detection

## Docker Deployment

For containerized deployments, use Docker:

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run nextjs
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t zeroheart-resume .

# Run container
docker run -p 3000:3000 \
  -e ZHIPU_API_KEY=your_key_here \
  zeroheart-resume
```

### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ZHIPU_API_KEY=${ZHIPU_API_KEY}
      - WENXIN_API_KEY=${WENXIN_API_KEY}
      - TONGYI_API_KEY=${TONGYI_API_KEY}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Manual Server Deployment

For traditional VPS or cloud server deployment:

### 1. Clone and Build

```bash
git clone https://github.com/zmh964767/ZeroHeart-ZhiHang.git
cd ZeroHeart-ZhiHang
npm install
npm run build
```

### 2. Set Environment Variables

```bash
export ZHIPU_API_KEY="your_key_here"
# ... other variables
```

Or create `.env.production.local`:
```env
ZHIPU_API_KEY=your_key_here
```

### 3. Start Application

```bash
# Development mode
npm start

# Or use PM2 for production
pm2 start npm --name "resume-builder" -- start
pm2 save
pm2 startup
```

### 4. Set up Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_resume your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

All AI provider keys are optional, but at least one is required for AI features:

| Variable | Required | Description |
|----------|----------|-------------|
| `ZHIPU_API_KEY` | No* | Zhipu AI API key (default provider) |
| `WENXIN_API_KEY` | No | Baidu Wenxin API key |
| `WENXIN_ACCESS_TOKEN` | No | Baidu Wenxin access token |
| `TONGYI_API_KEY` | No | Alibaba Tongyi Qianwen API key |
| `KIMI_API_KEY` | No | Moonshot Kimi API key |
| `DEEPSEEK_API_KEY` | No | DeepSeek API key |

\*At least one AI provider key must be configured

### Getting API Keys

- **Zhipu AI**: [https://open.bigmodel.cn/](https://open.bigmodel.cn/)
- **Wenxin**: [https://cloud.baidu.com/product/wenxinworkshop](https://cloud.baidu.com/product/wenxinworkshop)
- **Tongyi**: [https://dashscope.aliyun.com/](https://dashscope.aliyun.com/)
- **Kimi**: [https://platform.moonshot.cn/](https://platform.moonshot.cn/)
- **DeepSeek**: [https://platform.deepseek.com/](https://platform.deepseek.com/)

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application loads correctly at the domain URL
- [ ] Resume creation and editing works
- [ ] PDF export generates downloadable file
- [ ] AI features work (if API keys configured)
- [ ] Mobile responsiveness on real devices
- [ ] HTTPS is enabled (for production)
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring set up (optional but recommended)

## CI/CD with GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Runs tests on Node.js 18 and 20
2. Runs ESLint
3. Builds the project
4. Deploys to Vercel on main branch pushes

To enable:

1. Add secrets to GitHub repository settings:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
2. Push to `master` or `main` branch

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### AI Features Not Working

- Verify API keys are set correctly
- Check API key validity and quota
- Review server logs for error messages

### PDF Generation Issues

- Ensure font files exist in `public/fonts/`
- Check server has enough memory for PDF generation
- Verify file size limits (max 5MB)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation in README.md
- Review test files for usage examples
