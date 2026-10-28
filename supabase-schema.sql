-- ====================================================================
-- AI HR PORTAL SUPABASE SCHEMA
-- Project ID: ouxvtzvfbyqvpszwgwou
-- Paste and run this script in Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Full-time',
  experience TEXT NOT NULL,
  salary TEXT,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Candidates Table
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  linkedin TEXT,
  portfolio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Applications Table (Links Candidate + Job + Google Drive CV + Gemini AI Evaluation)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  candidate_linkedin TEXT,
  candidate_portfolio TEXT,
  resume_drive_url TEXT NOT NULL,
  resume_drive_file_id TEXT,
  resume_filename TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'Under Review',
  ai_score INTEGER DEFAULT 0,
  ai_verdict TEXT DEFAULT 'Under Review',
  ai_summary TEXT,
  ai_strengths TEXT[] DEFAULT '{}',
  ai_weaknesses TEXT[] DEFAULT '{}',
  ai_interview_questions TEXT[] DEFAULT '{}',
  ai_raw_evaluation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clean up any existing duplicate jobs by title before applying unique index
DELETE FROM public.jobs a USING public.jobs b
WHERE a.ctid < b.ctid AND a.title = b.title;

-- Create unique index on title so re-running this script will NEVER duplicate jobs
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_title ON public.jobs (title);

-- 5. Seed Initial Positions (idempotent with ON CONFLICT title)
INSERT INTO public.jobs (title, department, location, type, experience, salary, description, requirements, responsibilities, status)
VALUES
  (
    'Senior Full-Stack Engineer',
    'Engineering',
    'Remote / Hybrid',
    'Full-time',
    '4-6 years',
    '$70,000 - $95,000',
    'We are seeking a seasoned Senior Full-Stack Engineer to architect and build our next-generation cloud applications using React 19, Next.js, TypeScript, and modern distributed backends.',
    ARRAY['Expertise in Next.js, React, and TypeScript', 'Strong experience with Postgres, Supabase, and REST/GraphQL APIs', 'Experience building AI-powered features and LLM pipelines', 'Knowledge of cloud deployment (AWS/Vercel/GCP)'],
    ARRAY['Architect scalable web applications and micro-frontends', 'Lead technical design reviews and pair programming', 'Build resilient backend services and database migrations', 'Collaborate directly with product design and machine learning teams'],
    'Active'
  ),
  (
    'AI / Machine Learning Engineer',
    'Artificial Intelligence',
    'Remote',
    'Full-time',
    '3-5 years',
    '$85,000 - $115,000',
    'Join our core AI team to implement LLM workflows, evaluation frameworks, and intelligent agent architectures using Gemini, LangChain, and vector databases.',
    ARRAY['Proficiency with Python/TypeScript and LLM APIs (Gemini/OpenAI/Claude)', 'Hands-on experience with Retrieval Augmented Generation (RAG) and embeddings', 'Understanding of model fine-tuning and evaluation metrics', 'Experience with Docker and serverless AI functions'],
    ARRAY['Develop prompt engineering pipelines and structured JSON extraction models', 'Optimize inference latency and token economics', 'Integrate multimodal models for document understanding and automated CV parsing', 'Monitor model drift and benchmark AI evaluation accuracy'],
    'Active'
  ),
  (
    'Product Designer (UI/UX)',
    'Design',
    'Remote',
    'Full-time',
    '3-5 years',
    '$55,000 - $75,000',
    'Lead the design system, user journeys, and component library for our enterprise suite with high craft and detail.',
    ARRAY['Expert in Figma, auto-layout, design tokens, and prototyping', 'Demonstrated portfolio of SaaS dashboard and portal applications', 'Experience working closely with frontend developers using Tailwind CSS and Radix/shadcn', 'Strong understanding of accessibility (WCAG 2.1) and responsive design'],
    ARRAY['Design end-to-end user workflows for candidates and HR admins', 'Maintain and evolve our design token library', 'Conduct user interviews and usability tests', 'Create micro-interactions and animated UI specs'],
    'Active'
  ),
  (
    'HR Operations & Talent Specialist',
    'Human Resources',
    'On-site / Islamabad',
    'Full-time',
    '2-4 years',
    '$35,000 - $50,000',
    'Manage candidate pipelines, conduct introductory screenings, coordinate technical rounds, and optimize our AI-assisted recruitment workflows.',
    ARRAY['Proven experience in tech recruiting or talent acquisition', 'Familiarity with ATS tools and modern candidate evaluation systems', 'Exceptional communication and stakeholder management skills', 'Comfortable working in fast-paced startup environments'],
    ARRAY['Screen inbound applications and review Gemini AI candidate evaluations', 'Coordinate interviews between hiring managers and top candidates', 'Drive employee onboarding and positive candidate experiences', 'Analyze recruitment funnel conversion metrics and time-to-hire'],
    'Active'
  ),
  (
    'Cloud DevOps Architect',
    'Infrastructure',
    'Remote',
    'Full-time',
    '5+ years',
    '$90,000 - $120,000',
    'Design, automate, and scale cloud infrastructure, CI/CD pipelines, and high-availability database replication.',
    ARRAY['Deep expertise with Docker, Kubernetes, Terraform, and AWS/GCP', 'Hands-on experience with PostgreSQL high availability and Supabase', 'Robust CI/CD automation with GitHub Actions'],
    ARRAY['Manage cloud infrastructure reliability and security protocols', 'Automate deployment pipelines and environment staging', 'Monitor latency, uptime, and database connection pooling'],
    'Active'
  ),
  (
    'Senior Data Analyst',
    'Analytics',
    'Hybrid / Remote',
    'Full-time',
    '3-5 years',
    '$60,000 - $80,000',
    'Transform recruitment and operations data into actionable insights, dashboards, and executive intelligence.',
    ARRAY['Proficiency in SQL, Postgres, Python, and data modeling', 'Experience with modern BI visualization tools and dashboards', 'Solid statistical foundations and conversion funnel analysis'],
    ARRAY['Build ATS funnel analytics and talent acquisition dashboards', 'Partner with leadership to identify hiring bottlenecks', 'Model applicant conversion rates and predictive hiring timelines'],
    'Active'
  )
ON CONFLICT (title) DO NOTHING;

-- 6. Seed Candidates (idempotent with ON CONFLICT email)
INSERT INTO public.candidates (full_name, email, phone, linkedin, portfolio, location)
VALUES
  ('Hamza Tariq', 'hamza.tariq@example.com', '+92 300 1234567', 'https://linkedin.com/in/hamzatariq-dev', 'https://hamza.dev', 'Islamabad, Pakistan'),
  ('Zainab Malik', 'zainab.malik@example.com', '+92 321 7654321', 'https://linkedin.com/in/zainab-malik-ai', 'https://github.com/zainab-malik', 'Lahore, Pakistan'),
  ('Bilal Ahmed', 'bilal.ahmed@example.com', '+92 333 9988776', 'https://linkedin.com/in/bilal-design', 'https://bilal.design', 'Karachi, Pakistan'),
  ('Ayesha Khan', 'ayesha.khan@example.com', '+92 345 5566778', 'https://linkedin.com/in/ayesha-talent', 'https://ayeshakhan.me', 'Islamabad, Pakistan'),
  ('Danial Raza', 'danial.raza@example.com', '+92 312 8899001', 'https://linkedin.com/in/danialraza-cloud', 'https://danialraza.io', 'Remote / Islamabad'),
  ('Maryam Fatima', 'maryam.fatima@example.com', '+92 334 1122334', 'https://linkedin.com/in/maryam-analytics', 'https://maryam-analytics.github.io', 'Rawalpindi, Pakistan')
ON CONFLICT (email) DO NOTHING;

-- 7. Seed Initial Applications
INSERT INTO public.applications (
  candidate_id, job_id, job_title, candidate_name, candidate_email, candidate_phone, candidate_linkedin,
  candidate_portfolio, resume_drive_url, resume_drive_file_id, resume_filename, cover_letter,
  status, ai_score, ai_verdict, ai_summary, ai_strengths, ai_weaknesses, ai_interview_questions
)
SELECT
  c.id, j.id, j.title, c.full_name, c.email, c.phone, c.linkedin,
  c.portfolio, 'https://drive.google.com/file/d/1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU/view?usp=sharing',
  '1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU', 'Resume_2026.pdf',
  'Passionate professional with strong track record and domain expertise.',
  CASE
    WHEN c.email = 'hamza.tariq@example.com' THEN 'Shortlisted'
    WHEN c.email = 'zainab.malik@example.com' THEN 'Interview'
    WHEN c.email = 'ayesha.khan@example.com' THEN 'Shortlisted'
    WHEN c.email = 'danial.raza@example.com' THEN 'Shortlisted'
    ELSE 'Under Review'
  END,
  CASE
    WHEN c.email = 'hamza.tariq@example.com' THEN 94
    WHEN c.email = 'zainab.malik@example.com' THEN 91
    WHEN c.email = 'danial.raza@example.com' THEN 90
    WHEN c.email = 'ayesha.khan@example.com' THEN 88
    WHEN c.email = 'bilal.ahmed@example.com' THEN 86
    ELSE 79
  END,
  CASE
    WHEN c.email IN ('hamza.tariq@example.com', 'zainab.malik@example.com', 'danial.raza@example.com') THEN 'Strong Fit'
    WHEN c.email IN ('ayesha.khan@example.com', 'bilal.ahmed@example.com') THEN 'Good Fit'
    ELSE 'Moderate Fit'
  END,
  'Strong candidate qualifications and role alignment verified.',
  ARRAY['Strong technical competence', 'Excellent cultural fit', 'Clear communication'],
  ARRAY['Could expand on testing coverage'],
  ARRAY['Walk us through your architecture design choices?']
FROM public.candidates c
JOIN public.jobs j ON (
  (c.email = 'hamza.tariq@example.com' AND j.title = 'Senior Full-Stack Engineer') OR
  (c.email = 'zainab.malik@example.com' AND j.title = 'AI / Machine Learning Engineer') OR
  (c.email = 'bilal.ahmed@example.com' AND j.title = 'Product Designer (UI/UX)') OR
  (c.email = 'ayesha.khan@example.com' AND j.title = 'HR Operations & Talent Specialist') OR
  (c.email = 'danial.raza@example.com' AND j.title = 'Cloud DevOps Architect') OR
  (c.email = 'maryam.fatima@example.com' AND j.title = 'Senior Data Analyst')
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.applications a WHERE a.candidate_email = c.email
);

-- 8. Enable Row Level Security (RLS) & Set Policies
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent error 42710 on re-runs
DROP POLICY IF EXISTS "Public read active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admin manage jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public select candidates" ON public.candidates;
DROP POLICY IF EXISTS "Admin manage candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public insert applications" ON public.applications;
DROP POLICY IF EXISTS "Public select applications" ON public.applications;
DROP POLICY IF EXISTS "Admin manage applications" ON public.applications;

-- Allow public read of active jobs for candidate portal
CREATE POLICY "Public read active jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Admin manage jobs" ON public.jobs FOR ALL USING (true);

-- Allow candidate application submissions and reads
CREATE POLICY "Public insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Admin manage candidates" ON public.candidates FOR ALL USING (true);

CREATE POLICY "Public insert applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select applications" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Admin manage applications" ON public.applications FOR ALL USING (true);
