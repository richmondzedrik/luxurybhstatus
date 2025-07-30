# Deployment Guide for Boss Hunting Status App

## 🚀 Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- Supabase project set up and running

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your code to the repository

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Deploy!

### Step 3: Environment Variables
In Vercel dashboard, add these environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Update Supabase Settings
In your Supabase dashboard:
1. Go to Authentication > Settings
2. Add your Vercel domain to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app`

### Step 5: Test Your Deployment
- Visit your Vercel URL
- Test user registration
- Test login/logout
- Test status updates
- Test real-time features

## 🔧 Troubleshooting

### Common Issues:
1. **Environment variables not working**: Make sure they start with `VITE_`
2. **Authentication errors**: Check Supabase redirect URLs
3. **Build failures**: Check for any TypeScript/ESLint errors
4. **Real-time not working**: Verify Supabase Realtime is enabled

### Build Command Issues:
If build fails, try:
```bash
npm run build
```
locally first to check for errors.

## 📱 Domain Setup (Optional)
1. Buy a custom domain
2. Add it in Vercel dashboard
3. Update Supabase settings with new domain
4. Update CORS settings if needed
