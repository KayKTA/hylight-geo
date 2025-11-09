# GeoPhotos - Geotagged Photo Mapping Application

A modern web application that allows users to upload geotagged photos and display them on an interactive map. Users can add personal notes to their photos for future reference.

## 🎯 Features

- 🔐 **Authentication**: Secure magic link authentication via Supabase
- 📸 **Photo Upload**: Upload geotagged images with automatic EXIF GPS extraction
- 🗺️ **Interactive Map**: View all your photos on a beautiful Leaflet map
- 💬 **Personal Notes**: Add, edit, and delete notes on your photos
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates**: Instant UI updates after photo uploads and comments

## 🏗️ Architecture & Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Map**: Leaflet + React-Leaflet
- **Icons**: Lucide React
- **Styling**: Emotion (CSS-in-JS)

### **Backend & Database**
- **BaaS**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (private bucket)
- **Authentication**: Supabase Auth (Magic Link)

### **Additional Tools**
- **EXIF Extraction**: exifr
- **State Management**: React Context API
- **HTTP Client**: Supabase Client

## 🚀 Deployment

### **Local Development**

The application can be run locally using:

```bash
npm run dev
```

Access at `http://localhost:3000`

### **Production Deployment (Recommended: Vercel)**

#### Prerequisites:
- Vercel account
- Supabase project (already configured)

#### Steps:

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy to Vercel**
- Connect GitHub repository to Vercel
- Import project
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Configure Supabase**
- Add production URL to Supabase Auth redirect URLs
- Update CORS settings if needed

4. **Deploy**
```bash
vercel --prod
```

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account
- Git

### **Steps**

1. **Clone the repository**
```bash
git clone <repository-url>
cd hylight-geo
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**

Run the SQL migrations (see Database Schema section above)

5. **Configure Authentication**

In Supabase Dashboard → Authentication → URL Configuration:
- Add `http://localhost:3000/auth/callback` to Redirect URLs

6. **Run development server**
```bash
npm run dev
```

7. **Access the application**
Open `http://localhost:3000`

## 🔮 Future Enhancements

- **AI Descriptions**: Automatic photo descriptions using Claude API
- **Advanced Filters**: Search by date, location, tags
- **Teams**: Create teams to share photos with colleagues
- **Bulk Upload**: Upload multiple photos at once
- **Mobile App**: Native iOS/Android apps
