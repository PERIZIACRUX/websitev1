# CRUX × PERIZIA Platform

Unified college fest platform. CRUX is the cultural fest; PERIZIA is the academic fest with participant registration.

## Architecture

This project is a monorepo containing three npm workspaces:

- `frontend/`: Next.js application for public and staff interfaces.
- `backend/`: Node.js Express API with Prisma.
- `shared/`: Shared DTOs, schemas, and configurations.

## Local Development

### 1. Environment Variables
Copy `.env.example` in each directory:
- `cp frontend/.env.example frontend/.env`
- `cp backend/.env.example backend/.env`
Update the `.env` files with your local or test credentials. **Never commit real secrets.**

### 2. Install Dependencies
Run `npm install` from the root directory to install all workspace dependencies.

### 3. Database Setup (Neon/PostgreSQL)
Ensure your `backend/.env` has `DATABASE_URL` and `DIRECT_URL`.
```bash
cd backend
npm run prisma:generate
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 4. Running the Application
From the root directory:
```bash
# Start frontend
npm run dev:frontend

# Start backend
npm run dev:backend
```

## Testing
Tests are located in the `backend/tests` directory.
```bash
npm run test
```

## Deployment

### Frontend (Vercel)
The frontend is designed to be deployed on Vercel. 
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Environment Variables**: Must include `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BACKEND_API_URL`.

### Backend (Render)
The backend is designed to be deployed on Render as a Web Service.
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Environment Variables**: Must include `DATABASE_URL`, `FRONTEND_URL`, and other server-side integration keys.
