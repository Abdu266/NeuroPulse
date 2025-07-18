# Vercel Deployment Fix

## The Problem
You're seeing code instead of the app because Vercel is treating this as a static site, not a full-stack application.

## Step-by-Step Fix

### 1. Update Your GitHub Repository
Make sure you have these new files in your repository:
- `vercel.json` (in root)
- `client/package.json` (frontend-specific)
- `client/vite.config.ts` (updated for Vercel)
- `client/shared/` (copy of shared directory)

### 2. Vercel Project Settings
In your Vercel dashboard:

1. **Build Command**: `cd client && npm install && npm run build`
2. **Output Directory**: `client/dist`
3. **Install Command**: `npm install`
4. **Development Command**: `npm run dev`

### 3. Environment Variables
Add these to your Vercel project:

```
DATABASE_URL=your_neon_or_supabase_connection_string
SESSION_SECRET=any_random_32_character_string
REPL_ID=your_app_name
REPLIT_DOMAINS=your-vercel-domain.vercel.app
ISSUER_URL=https://replit.com/oidc
```

### 4. Framework Preset
In Vercel settings, set:
- **Framework Preset**: Other
- **Build & Development Settings**: Override enabled

### 5. Re-deploy
After making these changes:
1. Push to GitHub
2. In Vercel, go to Deployments
3. Click "Redeploy" on the latest deployment

## Alternative: Use Railway Instead

If Vercel continues to have issues, Railway is easier for full-stack apps:

1. Sign up at https://railway.app
2. Connect your GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Deploy automatically

Railway handles both frontend and backend without complex configuration.

## Database Options

For your PostgreSQL database, use one of these free options:
- **Neon**: https://neon.tech (recommended)
- **Supabase**: https://supabase.com
- **Railway**: Built-in PostgreSQL

## Need Help?

If you're still seeing code instead of the app:
1. Check the Vercel build logs for errors
2. Make sure the build command succeeded
3. Verify the output directory contains HTML files
4. Consider using Railway for simpler deployment

The files I've created should fix the Vercel deployment issue!