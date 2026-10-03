# TNest Production Deployment Guide (Supabase + Render + Vercel)

This guide details step-by-step instructions for deploying the **TNest** platform using:
- **Database**: [Supabase](https://supabase.com) (Production PostgreSQL database, permanent free tier, web GUI dashboard)
- **Backend API**: [Render](https://render.com) (ASP.NET Core .NET 10 Web API container)
- **Frontend SPA**: [Vercel](https://vercel.com) (React + TypeScript + Vite with global CDN)

---

## Architecture Overview

```
┌─────────────────────────┐          HTTPS / WSS SignalR Hub            ┌─────────────────────────┐
│     Vercel (Frontend)   │ ───────────────────────────────────────────> │     Render (Backend)    │
│  React + Vite SPA       │                                             │   .NET 10 Web API       │
│  https://tnest.vercel...│ <─────────────────────────────────────────── │  https://tnest-api...   │
└─────────────────────────┘                                             └────────────┬────────────┘
                                                                                     │
                                                                                     │ PostgreSQL Connection (TLS)
                                                                                     ▼
                                                                        ┌───────────────────────────┐
                                                                        │    Supabase PostgreSQL    │
                                                                        │  (Auto-seeded DB & GUI)   │
                                                                        └───────────────────────────┘
```

---

## Step 1: Create Supabase PostgreSQL Database

1. Go to [supabase.com](https://supabase.com) and click **Sign In** / **Start your project**.
2. Click **New Project** and configure:
   - **Name**: `tnest-db` (or any name)
   - **Database Password**: Choose a strong password and **save it somewhere safe**.
   - **Region**: Choose the region closest to you or Render (e.g. `US East`, `US West`, `Singapore`, `Central EU`).
   - **Plan**: `Free`.
3. Click **Create new project**.
4. Once the project finishes provisioning (takes ~1-2 minutes):
   - Go to **Project Settings** (gear icon in sidebar) &rarr; **Database**.
   - Scroll to **Connection string** section.
   - Select the **URI** or **ADO.NET** tab.
   - Copy the connection string:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
     ```
     *(Make sure to replace `[YOUR-PASSWORD]` with your actual Supabase database password)*.

---

## Step 2: Push Your Code to GitHub

1. Commit all files to Git:
   ```bash
   git add .
   git commit -m "Configure Supabase, Render, and Vercel production deployment"
   ```
2. Create a new repository on [GitHub](https://github.com/new) named `tnest`.
3. Push your repository:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/tnest.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy Backend to Render

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository `tnest`.
4. Configure the service settings:
   - **Name**: `tnest-backend` (or `tnest-api`)
   - **Language**: `Docker`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Health Check Path**: `/healthz`
5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   |---|---|---|
   | `ASPNETCORE_ENVIRONMENT` | `Production` | Enables production mode |
   | `DATABASE_URL` | `postgresql://postgres:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres` | Your Supabase connection string from Step 1 |
   | `JWT_SECRET_KEY` | *(Generate a 32+ character random secret)* | e.g. `TNest_SuperSecret_Jwt_EncryptionKey_2026_KeyMustBeLongEnough!` |
   | `JWT__Issuer` | `TNest` | JWT Issuer name |
   | `JWT__Audience` | `TNestAudience` | JWT Audience |
   | `ALLOWED_ORIGINS` | `https://localhost:5173` | *(We'll add your Vercel URL in Step 5)* |
6. Click **Create Web Service**.
7. Render will build the Docker container and start the API.
   - EF Core will automatically connect to your Supabase PostgreSQL database, create all tables (`Users`, `Requirements`, `Proposals`, `Projects`, `Conversations`, `Categories`, `Roles`, `Skills`), and seed default taxonomy and demo data!
8. Copy your Render backend URL (e.g., `https://tnest-backend.onrender.com`).

---

## Step 4: Deploy Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Import your GitHub repository `tnest`.
4. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://tnest-backend.onrender.com` *(Replace with your live Render backend URL from Step 3)* |
6. Click **Deploy**.

---

## Step 5: Verify Live Deployment

1. **Verify Backend Health**:
   Open `https://<YOUR-RENDER-BACKEND-URL>/healthz` in your browser.
   - Status: `200 OK` (Healthy)

2. **Verify Database in Supabase Dashboard**:
   - Open your Supabase project &rarr; **Table Editor**.
   - You will see all initialized tables: `Users`, `Categories`, `Requirements`, `Projects`, `RoleTaxonomies`, etc.

3. **Verify Full Application on Vercel**:
   - Open your Vercel URL (e.g., `https://tnest.vercel.app`).
   - Try browsing categories, logging in as a Client or Professional, posting a requirement, chatting in real-time, and managing projects!
