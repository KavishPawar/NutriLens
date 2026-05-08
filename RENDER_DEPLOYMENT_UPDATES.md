# NutriLens Render Deployment Updates

## 1. Objective
This update makes the project deployment-safe for Render by removing localhost-only assumptions, adding production-safe auth cookie behavior, and wiring frontend/backend URLs through environment variables.

## 2. Code Changes Completed

### Backend
1. Added production start command.
- File: `backend/package.json`
- Change: added `"start": "node server.js"`.

2. Added CORS dependency.
- File: `backend/package.json`, `backend/package-lock.json`
- Change: added `cors`.

3. Made server port dynamic.
- File: `backend/server.js`
- Change: uses `process.env.PORT` with fallback `3000`.

4. Added environment-driven deployment config.
- File: `backend/src/config/config.js`
- Change: added:
  - `FRONTEND_URL`
  - `BACKEND_URL`
  - `GOOGLE_CALLBACK_URL`
  - `isProduction`

5. Enabled CORS + credentials and proxy trust for Render.
- File: `backend/src/app.js`
- Change:
  - `app.set("trust proxy", 1)`
  - `cors({ origin: config.FRONTEND_URL, credentials: true })`
  - Google strategy callback URL uses `config.GOOGLE_CALLBACK_URL`.

6. Hardened auth cookies for production.
- File: `backend/src/controllers/auth.controller.js`
- Change:
  - `httpOnly: true`
  - `secure: true` in production
  - `sameSite: "none"` in production (`"lax"` in dev)
  - unified cookie options for login/google auth/logout.

7. Removed localhost redirect dependency for Google auth.
- Files:
  - `backend/src/controllers/auth.controller.js`
  - `backend/src/routes/auth.routes.js`
- Change:
  - success redirect uses `config.FRONTEND_URL`
  - failure redirect uses `${config.FRONTEND_URL}/login`

### Frontend
1. Added centralized API base URL builder.
- File: `frontend/src/shared/api.config.js`
- Change: `buildApiUrl("/api/...")` with `VITE_API_BASE_URL` support.

2. Migrated all API clients to env-based base URLs.
- Files:
  - `frontend/src/features/auth/services/auth.api.js`
  - `frontend/src/features/product/services/product.api.js`
  - `frontend/src/features/product/services/admin.api.js`
- Change: baseURL now resolves from `VITE_API_BASE_URL`.

3. Migrated Google login entrypoint to env-based backend URL.
- File: `frontend/src/features/components/Google.jsx`
- Change: auth URL now uses `buildApiUrl("/api/auth/google")`.

## 3. Env Templates Added

1. Backend template:
- File: `backend/.env.example`

2. Frontend template:
- File: `frontend/.env.example`

## 4. Render Setup Checklist

## 4A. Single-Service Plan (Your Preferred Flow)
Use this when deploying only the backend service and serving frontend from it.

### Local Build + Copy Steps
1. Build frontend:
   - From `frontend`: `npm run build`
2. Copy the generated `frontend/dist` contents into `backend/public`.
   - Final expected file: `backend/public/index.html`
3. Deploy backend service on Render.

### Why this works
Backend now serves static files from `backend/public` and has SPA fallback for all non-API routes.

### Backend Render Env (single-service)
Set:
- `BACKEND_URL=https://<your-backend>.onrender.com`
- `FRONTEND_URL=https://<your-backend>.onrender.com`
- `GOOGLE_CALLBACK_URL=https://<your-backend>.onrender.com/api/auth/google/callback`

### Frontend env for single-service build
Before running frontend build, set:
- `VITE_API_BASE_URL=` (empty string)
  - This makes API calls use same-origin paths like `/api/auth`, `/api/product`.

### Backend Web Service (Render)
1. Root directory: `backend`
2. Build command: `npm install`
3. Start command: `npm start`
4. Required env vars:
   - `PORT` (Render injects this automatically)
   - `NODE_ENV=production`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL` = `https://<your-backend>.onrender.com/api/auth/google/callback`
   - `FRONTEND_URL` = `https://<your-frontend>.onrender.com`
   - `BACKEND_URL` = `https://<your-backend>.onrender.com`
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD`
   - `IMAGEKIT_PRIVATE_KEY`
   - `MISTRAL_API_KEY`

### Frontend Static Site (Render)
1. Root directory: `frontend`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Required env vars:
   - `VITE_API_BASE_URL=https://<your-backend>.onrender.com`

## 5. Post-Deploy Required External Updates
1. Google Cloud OAuth:
   - Authorized redirect URI:
     - `https://<your-backend>.onrender.com/api/auth/google/callback`
   - Authorized JavaScript origin:
     - `https://<your-frontend>.onrender.com`

## 6. Validation Checklist
1. Login with email/password works.
2. Google login works and redirects back to frontend.
3. Session persists (cookie set, authenticated routes accessible).
4. Product fetch works.
5. Product history loads for authenticated users.
6. Admin APIs still work for admin role.
7. Logout clears session and blocks protected endpoints.

## 7. Notes
1. Local development still works with localhost defaults if env variables are set from `.env.example`.
2. Existing guest behavior remains unchanged:
   - Unauthenticated users cannot fetch product/history APIs.
