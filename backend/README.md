# MentorMe backend (minimal auth)

Provides `GET /api/auth/me` for the frontend. Validates Supabase JWT and returns current user (id, name, email, role, etc.).

## Setup

1. Copy `.env.example` to `.env` and set:
   - `SUPABASE_JWT_SECRET` — from Supabase: **Settings → API → JWT secret**

2. Install and run:

   ```bash
   npm install
   npm start
   ```

   Server runs at `http://localhost:4000`.

## Frontend .env

In the **frontend** folder, ensure `.env` has:

- `VITE_API_URL=http://localhost:4000`
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase (Settings → API)

Then run the frontend (`npm run dev`) and test login at `/login`.
