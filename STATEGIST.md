# 🧠 The Strategist – Project Plan

---

## 1️⃣ Technologies & Tools

| Layer | Tool | Reason |
|--------|------|--------|
| **Frontend** | Next.js (App Router) + TypeScript + MUI | Modern, component-based, SSR-ready and easy to scale |
| **Map** | React-Leaflet | Simple and flexible for rendering markers and popups |
| **Backend / Database** | Supabase (PostgreSQL + RLS) | Built-in authentication, storage, and real-time database |
| **Storage** | Supabase Storage (private bucket + signed URLs) | Secure file hosting and access control |
| **Auth** | Supabase Magic Link | Easy, passwordless authentication flow |
| **Metadata** | `exifr` | Extracts GPS coordinates from photo EXIF data |
| **Deployment** | Vercel | Simple CI/CD and perfect fit for Next.js |

---

## 2️⃣ System Structure

### 🏗️ Overview

```
User → Next.js frontend (React)
↳ Supabase Auth (Magic Link)
↳ Supabase Database (photos, comments)
↳ Supabase Storage (private bucket)
↳ React-Leaflet map (photo markers)
```

- The app uses **Supabase client SDK** for all database and storage operations.
- Each photo record is linked to a storage path and contains EXIF, GPS, and metadata.
- **Row Level Security (RLS)** ensures users only access their own data.

---

## 3️⃣ Data Flow

**Upload Flow**
1. User selects an image.
2. EXIF GPS metadata is extracted with `exifr`.
3. The image is uploaded to a private Supabase bucket.
4. A record is added to the `photos` table with coordinates, EXIF data, and metadata.

**Map Flow**
1. The app fetches all photos for the logged-in user.
2. Each photo’s signed URL is generated for secure access.
3. Leaflet displays markers at each GPS coordinate.
4. Clicking a marker opens a popup with photo details.

**Comment Flow**
1. User opens the photo detail modal.
2. Comments are fetched via `photo_id`.
3. User can post new comments (stored in `comments` table).

---

## 4️⃣ Deployment Plan

- **Environment**: Vercel for hosting, Supabase for backend services
- **Env variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Auth redirect URL**: `/auth/callback`
- The app can be deployed in minutes via `vercel deploy`.

---

## 5️⃣ Estimated Effort

| Phase | Task | Time |
|-------|------|------|
| Setup | Project init, Supabase config | 0.5h |
| Backend | Schema, RLS, storage | 1h |
| Auth | Magic Link flow | 1h |
| Frontend | Layout, routing, theme | 1h |
| Map | Leaflet + markers | 1.5h |
| Upload | Form + EXIF + validation | 1.5h |
| Comments | CRUD operations | 1h |
| Polish & Deployment | Responsiveness, testing, Vercel setup | 1h |
| Documentation | README, cleanup | 0.5h |
| **Total** | **≈ 9.5 hours** | |

---
## 6️⃣ Architecture Overview

```
/app
├─ page.tsx      # Main map view (Server Component)
├─ upload/       # Photo upload form
├─ login/        # Magic link login
├─ auth/
└─ layout.tsx    # Global layout & providers (MUI theme, auth)

/components
├─ Explorer.tsx    # Sidebar + Map wrapper
├─ MapClient.tsx   # Leaflet map with markers
├─ UploadModal.tsx # Photo upload dialog
└─ Navbar.tsx      # App navigation bar

/lib
├─ supabase/
├─ api/
└─ utils/

/middleware.ts # Supabase session refresh middleware
```

### Design goals
- **Separation of concerns:** database, UI, and business logic are clearly separated.
- **Scalability:** easy to extend (e.g., add albums, AI captioning, or teams).
- **Reusability:** core components (upload, map, comments) can be reused in other contexts.
- **Consistency:** all API calls centralized in `/lib/api`.

---

## ✅ Key Design Choices

- **Private-first model:** Each user sees only their own photos by default.
- **Optional public visibility:** A photo can be shared and commented on by others.
- **Secure storage:** Access via signed URLs, not public paths.
- **Lightweight architecture:** Everything runs on Supabase + Vercel, fully serverless.
- **Extendable:** Easy to add albums, teams, or AI-generated captions later.

---

## 💬 Summary

This plan ensures:
- A modular, maintainable architecture
- Data security through RLS
- A fast, intuitive user experience
- A realistic 8–10h delivery scope for a clean MVP
