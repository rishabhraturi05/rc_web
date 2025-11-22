# Vercel Deployment Guide for NextAuth with JWT

This guide will help you deploy your application to Vercel without the "Server error - There is a problem with the server configuration" error.

## Required Environment Variables

You **MUST** set these environment variables in your Vercel project settings:

### 1. NEXTAUTH_SECRET (Required) ⚠️ CRITICAL
This is the secret key used to sign and encrypt JWT tokens. **This is critical - without it, authentication will fail and you'll get "Server error - There is a problem with the server configuration".**

**How to generate:**

**Windows (PowerShell):**
```powershell
openssl rand -base64 32
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Node.js (Alternative):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Quick copy-paste for Windows:**
```powershell
openssl rand -base64 32 | clip
```
(This generates and copies to clipboard automatically!)

**Example output:**
```
Xk8pL9mN2qR5tW7vY0zA3bC6dE9fG1hI4jK7lM0nO2pQ5rS8tU1vW4xY7zA=
```

**In Vercel:**
1. Go to your project → Settings → Environment Variables
2. Click **Add New**
3. **Name:** `NEXTAUTH_SECRET`
4. **Value:** Paste your generated secret (the long random string)
5. **Environment:** Select **ALL** (Production, Preview, and Development)
6. Click **Save**
7. **IMPORTANT:** Redeploy your application for changes to take effect

**⚠️ Security Warning:**
- Never commit this to Git
- Use different secrets for Production and Development
- Keep it secure and private

### 2. JWT_SECRET (Optional - Fallback)
If you prefer to use `JWT_SECRET` instead, you can set this. The code will use `NEXTAUTH_SECRET` first, then fall back to `JWT_SECRET`.

### 3. MONGODB_URI (Required)
Your MongoDB connection string.

**Format:** `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

### 4. NEXTAUTH_URL (Optional but Recommended)
Your production URL. Vercel usually auto-detects this, but you can set it explicitly.

**How to find your NEXTAUTH_URL:**

1. **After deploying to Vercel:**
   - Go to your Vercel project dashboard
   - Look at the deployment URL (shown after deployment completes)
   - It will be something like: `https://your-project-name.vercel.app`

2. **If you have a custom domain:**
   - Use your custom domain: `https://yourdomain.com`
   - Example: `https://rc-nitw.vercel.app` or `https://rc-nitw.com`

3. **For different environments:**
   - **Production:** `https://your-production-url.vercel.app` or `https://yourdomain.com`
   - **Preview:** `https://your-preview-branch.vercel.app` (auto-generated for each PR)
   - **Development:** `http://localhost:3000` (for local development)

**Note:** With `trustHost: true` in the code, Vercel usually auto-detects this, so you may not need to set it. Only set it if you encounter issues with authentication redirects.

## Step-by-Step Vercel Setup

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Set Environment Variables**
   - In project settings → Environment Variables
   - Add all required variables (see above)
   - Make sure to apply to all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Verification

After deployment, test these endpoints:

1. **Login Page:** `https://yourdomain.com/admin/login`
   - Should load without errors

2. **Admin Routes:** `https://yourdomain.com/admin/responses`
   - Should redirect to login if not authenticated
   - Should work after successful login

3. **NextAuth API:** `https://yourdomain.com/api/auth/signin`
   - Should return NextAuth sign-in page (not an error)

## Troubleshooting

### Error: "There is a problem with the server configuration"

**Cause:** Missing `NEXTAUTH_SECRET` environment variable

**Solution:**
1. Go to Vercel project settings
2. Add `NEXTAUTH_SECRET` environment variable
3. Redeploy the application

### Error: "Invalid credentials" on login

**Cause:** Database connection issue or wrong credentials

**Solution:**
1. Check `MONGODB_URI` is set correctly
2. Verify MongoDB connection string is valid
3. Check admin user exists in database

### Error: "Unauthorized" when accessing admin routes

**Cause:** JWT token not being created or validated properly

**Solution:**
1. Verify `NEXTAUTH_SECRET` is set
2. Check browser console for errors
3. Clear cookies and try logging in again

## Code Features for Vercel Compatibility

✅ `trustHost: true` - Required for Vercel serverless functions
✅ JWT strategy - Works in serverless environments
✅ Proper error handling for missing secrets
✅ Edge-compatible middleware
✅ Secure cookie configuration for production

## Security Notes

- Never commit `NEXTAUTH_SECRET` to your repository
- Use different secrets for Production, Preview, and Development
- Keep your MongoDB connection string secure
- Regularly rotate your secrets

