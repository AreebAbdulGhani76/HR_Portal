# TalentPulse AI - Modern HR Recruitment & Candidate Screening Portal

TalentPulse AI is a high-performance, full-stack HR Recruitment and Talent Acquisition platform built with Next.js 16, React 19, TypeScript, Supabase, Google Drive API, and Google Gemini AI.

---

## Key Highlights

- **Careers Portal (`/careers`)**: Beautiful candidate-facing portal with real-time job openings, interactive filters, and an application submission flow.
- **Automated Resume Storage (Google Drive)**: Resumes uploaded by candidates are stored in Google Drive with instant preview links.
- **Multimodal AI Candidate Screening (Google Gemini AI)**: Evaluates resumes against role descriptions, calculates compatibility scores (0-100), generates fit verdicts, extracts key strengths, flags weaknesses, and creates custom interview questions.
- **AI HR Recruitment Dashboard (`/dashboard/hr`)**: Real-time recruitment analytics, candidate drawer with deep AI insights, stage updates (Under Review, Shortlisted, Interview, Hired, Rejected), and role filtering.
- **PostgreSQL Database & RLS (Supabase)**: Relational schema tracking jobs, candidates, and multi-stage applications with Row-Level Security policies.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons, Radix UI primitives
- **Database**: Supabase (PostgreSQL with RLS policies)
- **AI Intelligence**: Google Gemini AI (`gemini-3-flash-preview` / `gemini-1.5-flash`)
- **File Storage**: Google Drive API (OAuth2)
- **Authentication**: Route-protected sessions with HTTP-only cookies

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/AreebAbdulGhani76/HR_Portal.git
cd HR_Portal
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (refer to `.env.example`):

```env
# Authentication
AUTH_EMAIL="abis@datacrumbs.org"
AUTH_PASSWORD="abis@datacrumbs.org"
NEXT_PUBLIC_AUTH_EMAIL="abis@datacrumbs.org"
NEXT_PUBLIC_AUTH_PASSWORD="abis@datacrumbs.org"

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="https://<project-id>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"
SUPABASE_PROJECT_ID="<your-project-id>"

# Google Drive Credentials
GOOGLE_DRIVE_CLIENT_ID="<your-client-id>.apps.googleusercontent.com"
GOOGLE_DRIVE_CLIENT_SECRET="<your-client-secret>"
GOOGLE_DRIVE_REFRESH_TOKEN="<your-refresh-token>"
GOOGLE_DRIVE_FOLDER_ID="<your-google-drive-folder-id>"

# Gemini AI API Key
GEMINI_API_KEY="<your-gemini-api-key>"
```

### 3. Setup Database Schema

Run the provided SQL script [`supabase-schema.sql`](./supabase-schema.sql) in your Supabase SQL Editor. It creates:
- `public.jobs`
- `public.candidates`
- `public.applications`
- Row-Level Security (RLS) policies and initial seed data.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Careers Portal**: `http://localhost:3000/careers`
- **HR Dashboard**: `http://localhost:3000/dashboard/hr`
- **Candidate Pipeline**: `http://localhost:3000/dashboard/candidates`
- **Admin Login**: `http://localhost:3000/login`

---

## Project Structure

```text
├── src/
│   ├── app/
│   │   ├── (main)/dashboard/
│   │   │   ├── hr/              # HR Analytics & Candidate Table
│   │   │   ├── candidates/      # Candidate Pipeline View
│   │   │   ├── jobs/            # Job Listings Management
│   │   │   └── _components/     # Candidate Detail Drawer & Widgets
│   │   ├── api/
│   │   │   ├── admin/           # Admin candidate & application endpoints
│   │   │   ├── auth/            # Sign-in authentication route
│   │   │   └── careers/         # Job listings and application submission
│   │   ├── careers/             # Public-facing Careers Portal
│   │   └── login/               # Admin sign-in screen
│   ├── components/ui/           # Reusable Radix UI & Tailwind components
│   └── lib/
│       ├── gemini-ai.ts         # Google Gemini AI screening engine
│       ├── google-drive.ts      # Google Drive resume uploader
│       ├── hr-service.ts        # Candidate and job management logic
│       └── supabase.ts          # Supabase client and service role
├── supabase-schema.sql          # Database schema and seed data
└── vercel.json                  # Deployment configuration
```

---

## License

MIT License. Designed and maintained for modern talent acquisition.
