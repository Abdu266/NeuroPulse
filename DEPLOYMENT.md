# TechNeurology - NeuroRelief Deployment Guide

## Free Deployment Options

### 1. Vercel (Recommended for Full-Stack Apps)
**Cost**: Free tier available
**Best for**: Full-stack applications with serverless functions

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json` in root:
```json
{
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**/*",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/index.html"
    }
  ]
}
```
3. Run: `vercel --prod`

### 2. Railway
**Cost**: Free tier available
**Best for**: Full-stack apps with databases

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`
4. Add PostgreSQL database: `railway add postgresql`

### 3. Netlify + Supabase
**Cost**: Free tiers available
**Best for**: Frontend + managed database

1. Deploy frontend on Netlify
2. Use Supabase for PostgreSQL database
3. Update environment variables

## Required Environment Variables

```
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_session_secret_key
REPL_ID=your_app_id
REPLIT_DOMAINS=your_deployed_domain.com
ISSUER_URL=https://replit.com/oidc
```

## Database Setup

### Using Neon (Free PostgreSQL)
1. Sign up at https://neon.tech
2. Create a new database
3. Copy connection string to DATABASE_URL
4. Run migrations: `npm run db:push`

### Using Supabase (Free PostgreSQL)
1. Sign up at https://supabase.com
2. Create a new project
3. Copy connection string to DATABASE_URL
4. Run migrations: `npm run db:push`

## Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Database migrations
npm run db:push
```

## Package.json Scripts
Add these to your package.json:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "start": "node dist/server/index.js",
    "dev": "NODE_ENV=development tsx server/index.ts",
    "db:push": "drizzle-kit push"
  }
}
```

## Authentication Setup

The app uses Replit Auth. For production deployment:
1. Contact Replit support to enable OAuth for your domain
2. Or implement alternative authentication (Auth0, Firebase, etc.)
3. Update the auth configuration in `server/replitAuth.ts`

## Quick Start with Railway

1. Download your code from Replit
2. Upload to GitHub
3. Connect Railway to your GitHub repo
4. Add PostgreSQL database
5. Set environment variables
6. Deploy!

## Alternative: Use Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

Deploy on any platform that supports Docker (Railway, Render, etc.)