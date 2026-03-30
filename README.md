# MentorMe — Frontend

This document describes **what the system is**, **what the frontend implements**, and **what the backend is expected to provide**.

---

## 1. What the system is about

**MentorMe** is a mentorship platform that connects **mentees** (people seeking guidance) with **mentors** (experienced professionals who offer sessions).

- **Mentees** can browse mentors, request mentorship, book sessions, join video calls, chat in-session, and rate sessions.
- **Mentors** can receive and accept/decline requests, manage mentees and sessions, join session rooms, and receive ratings.
- **Admins** have dashboards for users and sessions (frontend in place; backend may be partial).

The frontend is a **React (Vite)** SPA that talks to a **REST API** and uses **Supabase** for authentication. All API calls are defined in `src/lib/api.ts` and assume a backend that implements the contracts below.

---

## 2. Frontend features (implemented)

Features are grouped by **role** and by **area** (auth, profile, mentors, sessions, etc.).

### 2.1 Public (no login)

| Feature | Where | Description |
|--------|--------|-------------|
| Landing | `/` | Marketing home page. |
| Browse (public) | `/browse` | Public mentor listing (currently mock data). |
| How it works | `/how-it-works` | Explainer page. |
| For mentors | `/for-mentors` | Page for potential mentors. |
| About | `/about` | About the platform. |
| Login | `/login` | Email/password sign-in; redirects by role (mentee → `/dashboard`, mentor → `/mentor/dashboard`, admin → `/admin/dashboard`). |
| Register | `/register` | Sign-up with name, email, password, and **role** (mentee or mentor). Role is sent to backend and used for redirect after login. |
| Forgot password | `/forgot-password` | Password reset entry (flow depends on Supabase). |

### 2.2 Authentication and user identity

| Feature | Where | Description |
|--------|--------|-------------|
| Auth context | `src/app/context/AuthContext.tsx` | Wraps app; provides `user`, `loginWithPassword`, `signUp`, `logout`, `refreshUser`. Session restored via Supabase + `GET /api/auth/me`. |
| Role-based redirect | Login, ProtectedRoute | After login, user is sent to role-specific dashboard. If URL is default, redirect uses `user.role`. |
| Protected routes | `src/app/components/ProtectedRoute.tsx` | Redirects unauthenticated users to `/login` and wrong-role users to their dashboard. |

### 2.3 Mentee features

| Feature | Route / Page | Description |
|--------|----------------|-------------|
| Dashboard | `/dashboard` | Welcome with user name; stats (total sessions, active mentors, goal progress, learning time); **upcoming sessions** from API; **recommended mentors** from API (or fallback list); links to Sessions and Browse. |
| Browse mentors | `/mentors` | List from **recommended** API (or **all mentors**); search by name/skills; filter by expertise and minimum rating; sort by “Recommended for you” or “Highest rated”. |
| Mentor profile | `/mentors/:id` | Mentor details from API (name, avatar, bio, skills, rating, review count); **reviews** from ratings API; **Request mentorship** dialog (topic + message) → `POST /api/requests`. |
| My sessions | `/sessions` | Upcoming and completed sessions from API; join session, cancel; **rate** completed sessions via modal → `POST /api/sessions/:id/ratings`. |
| Session room | `/session/:id` | Load session; ensure video room; in-session **chat** (send + realtime via Supabase); end call; layout for video + chat + notes. |
| Messages | `/messages` | Conversation list (currently mock); copy explains that in-session chat is in the session room. |
| Resources | `/resources` | Static/resources content. |
| Settings | `/settings` | **Profile**: name, bio, gender, skills (comma-separated), goals (comma-separated); load/save via profile API. **Account**: “Account type” (Mentee / Mentor); update role via profile API and redirect to correct dashboard. |

### 2.4 Mentor features

| Feature | Route / Page | Description |
|--------|----------------|-------------|
| Dashboard | `/mentor/dashboard` | Stats; pending requests; upcoming sessions; active mentees summary; accept/decline requests; start session → session room. |
| Requests | `/mentor/requests` | List of mentorship requests from API; accept/decline; view mentee profile. |
| My mentees | `/mentor/mentees` | List from API; progress and next session; link to mentee detail. |
| Mentee detail | `/mentor/mentees/:id` | Single mentee and their sessions from API. |
| Session management | `/mentor/sessions` | Calendar view; list of upcoming/completed sessions; **rate** completed sessions via modal → same ratings API. |
| Settings | `/settings` | Same Settings page as mentee (profile + account type); layout uses mentor nav when `user.role === 'mentor'`. |

### 2.5 Admin features (UI only)

| Feature | Route | Description |
|--------|--------|-------------|
| Dashboard | `/admin/dashboard` | Overview (mock or partial backend). |
| Users | `/admin/users` | User list (mock data). |
| Sessions | `/admin/sessions` | Session list (mock or partial). |
| Settings | `/admin/settings` | Admin settings. |

### 2.6 Shared UI behaviour

- **Dashboard layout** (`DashboardLayout`): Role-based sidebar (mentee / mentor / admin), logo, notifications dropdown (mock), avatar, sign out.
- **Rating modal**: Used on mentee Sessions and mentor Session management; submits rating, comment, and tags to the backend.
- **Profile and account type**: Single Settings page for mentee and mentor; role update triggers `refreshUser` and redirect.

---

## 3. Backend integration guide

The frontend expects a **REST API** and **Supabase Auth**. All requests (except auth) send `Authorization: Bearer <access_token>` where the token is the Supabase session access token.

### 3.1 Authentication

The backend must:

1. **Validate Supabase JWT** on protected routes (e.g. using `SUPABASE_JWT_SECRET`).
2. **Resolve or create an internal user** from the JWT (e.g. by `sub` / Supabase user id), and store/update **role** from JWT `user_metadata.role` or `app_metadata.role` so mentees and mentors are distinguished.
3. **Expose current user** for the frontend to restore session and show correct dashboard.

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api/auth/me` | Return current user (id, name, email, **role**, avatarUrl, bio, gender, skills, goals). Used after login and on app load. |

### 3.2 Profile

The frontend loads and updates profile (including role) from a single resource.

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api/profile/me` | Same shape as auth/me (profile fields). |
| PATCH | `/api/profile` | Body: `name?`, `avatarUrl?`, `bio?`, `gender?`, `skills?` (string[]), `goals?` (string[]), **`role?`** (`"mentee"` \| `"mentor"`). Update current user; role change allows account-type switch. |

### 3.3 Mentors (discovery and detail)

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api/mentors` | List mentors: `{ id, name, avatarUrl, email, bio, skills, averageRating, ratingCount }[]`. |
| GET | `/api/mentors/recommended` | Same shape as list; **sorted by match score** (e.g. mentee skills/goals vs mentor skills) then rating. **Caller must be mentee.** |
| GET | `/api/mentors/:id` | Single mentor (same fields + ratingCount). |
| GET | `/api/mentors/:id/ratings` | Ratings received by mentor: `{ id, rating, comment, tags, createdAt, rater: { id, name }, session: { id, topic, scheduledAt } }[]`. |

### 3.4 Mentorship requests

| Method | Path | Purpose |
|--------|------|--------|
| POST | `/api/requests` | Body: `mentorId`, `topic`, `message`, `preferredTime?`. Create request (caller = mentee). |
| GET | `/api/mentor/requests` | List requests for current mentor: `{ id, menteeId, mentorId, topic, message, preferredTime, status, createdAt, mentee: { id, name, avatarUrl } }[]`. |
| PATCH | `/api/mentor/requests/:requestId` | Body: `{ status: "accepted" \| "declined" }`. Mentor responds. |

### 3.5 Sessions

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api/sessions` | List sessions for current user (mentee or mentor): `{ id, mentorId, menteeId, topic, scheduledAt, durationMinutes, status, videoRoomUrl, mentor: { id, name, avatarUrl }, mentee: { id, name, avatarUrl } }[]`. |
| GET | `/api/sessions/:id` | Session detail including **messages** array. |
| POST | `/api/sessions` | Body: `mentorId`, `topic`, `scheduledAt`, `durationMinutes`. Create session (e.g. after request accepted). |
| PATCH | `/api/sessions/:id` | Body: `{ status }` (`scheduled` \| `in_progress` \| `completed` \| `cancelled`). |
| POST | `/api/sessions/:id/room` | Ensure video room exists; return `{ url }` (e.g. Daily.co or similar). |
| POST | `/api/sessions/:id/messages` | Body: `{ text }`. Add in-session message; return message with sender and `createdAt`. |
| GET | `/api/sessions/:id/ratings` | List ratings for this session (participants only). |
| POST | `/api/sessions/:id/ratings` | Body: `{ rating (1–5), comment, tags (string[]) }`. Upsert rating for current user (one per session per rater). |

### 3.6 Mentor: mentees

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api/mentor/mentees` | List mentees for current mentor: `{ id, name, avatarUrl, sessionsCompleted, nextSession: { id, topic, scheduledAt, durationMinutes } \| null }[]`. |
| GET | `/api/mentor/mentees/:menteeId` | Mentee detail and their sessions. |

### 3.7 Recommended mentors (matching)

The frontend calls **`GET /api/mentors/recommended`** for the mentee dashboard and browse page. The backend should:

- Authenticate the user and ensure they are a **mentee**.
- Compute a **match score** (e.g. overlap of mentee `skills` and `goals` with mentor `skills`).
- Return the same mentor list shape as `GET /api/mentors`, **sorted by match score** (desc), then by `averageRating` (desc), then by `ratingCount` (desc).

Details can be documented in the backend or in a shared doc (e.g. `docs/MATCHING_ALGORITHM.md`).

---

## 4. Data shapes (summary)

- **User / profile**: `id`, `name`, `email`, `role`, `avatarUrl?`, `bio?`, `gender?`, `skills[]`, `goals[]`.
- **Mentor list item**: above (without goals) + `averageRating?`, `ratingCount`.
- **Session list item**: `id`, `mentorId`, `menteeId`, `topic`, `scheduledAt`, `durationMinutes`, `status`, `videoRoomUrl?`, `mentor` (id, name, avatarUrl), `mentee` (id, name, avatarUrl).
- **Session detail**: list item + `messages[]` (id, senderId, text, createdAt, sender).
- **Rating**: `id`, `rating`, `comment?`, `tags[]`, `createdAt`, `rater`, `session` (for mentor ratings list).

All relevant types are defined in **`src/lib/api.ts`**.

---

## 5. Environment (frontend)

- **`VITE_API_URL`**: Backend base URL (e.g. `http://localhost:4000`). Required for API calls.
- **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`**: Supabase project credentials for auth and (optionally) realtime. If missing, auth and realtime will not work.

---

## 6. Quick reference: frontend → backend

| Frontend action | Backend process |
|-----------------|-----------------|
| Login / session restore | Validate JWT; return user with **role** from DB (synced from JWT when present). |
| Register (mentee/mentor) | Supabase sign-up with `user_metadata.role`; on first API call, create/update user with that role. |
| Load dashboard (mentee) | `GET /api/sessions`, `GET /api/mentors/recommended`. |
| Load dashboard (mentor) | `GET /api/sessions`, `GET /api/mentor/requests`. |
| Browse mentors | `GET /api/mentors/recommended` (or `GET /api/mentors` if 403). |
| Mentor profile + reviews | `GET /api/mentors/:id`, `GET /api/mentors/:id/ratings`. |
| Request mentorship | `POST /api/requests` with mentorId, topic, message. |
| Accept/decline request | `PATCH /api/mentor/requests/:id` with status. |
| List/join session | `GET /api/sessions`, `GET /api/sessions/:id`, `POST /api/sessions/:id/room`. |
| Session chat | `POST /api/sessions/:id/messages`; optional realtime (e.g. Supabase) for live updates. |
| Rate session | `POST /api/sessions/:id/ratings` with rating, comment, tags. |
| Update profile / account type | `PATCH /api/profile` (including `role`). |

## 7. How to get login working locally

1. **Quick demo login (no Supabase, no backend)**:
   - Use the provided `.env` (or copy `.env.example` to `.env`) with `VITE_DEMO_AUTH=true`.
   - Do **not** fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` yet.
   - Run `npm run dev` from the frontend root.
   - Go to `/login` and sign in with **any** email/password; you'll be logged in as a demo mentee user (data is not persisted).
   - You can also “sign up” on `/register`; in demo mode this just creates a local demo user with the selected role.
2. **Configure real frontend auth**: when ready to connect Supabase, set `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` in `.env` using your backend URL and Supabase project values (Settings → API in the Supabase dashboard), and set `VITE_DEMO_AUTH=false`.
3. **Configure and run the minimal backend**: in the `backend` folder, copy `.env.example` to `.env`, set `SUPABASE_JWT_SECRET` from Supabase (Settings → API → JWT secret), then run `npm install` and `npm start` to expose `GET /api/auth/me` on `http://localhost:4000`.
4. **Run the frontend with real auth**: from the frontend root, run `npm run dev` and open the app in your browser.
5. **Test login**: register a user (if needed), then log in at `/login`; you should be redirected to the correct dashboard for your role and stay logged in on page refresh.

This README is the single place to understand **what the system is**, **what the frontend does**, and **what the backend must implement** for the app to work end-to-end.
#   M e n t o r F E  
 