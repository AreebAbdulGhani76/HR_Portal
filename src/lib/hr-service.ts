import { supabaseAdmin } from "./supabase";
import { evaluateCandidateWithGemini, type AiEvaluationResult } from "./gemini-ai";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  status: "Active" | "Closed" | "Draft";
  created_at: string;
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
  created_at: string;
}

export interface Application {
  id: string;
  candidate_id?: string;
  job_id: string;
  job_title: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  candidate_linkedin?: string;
  candidate_portfolio?: string;
  resume_drive_url: string;
  resume_drive_file_id?: string;
  resume_filename?: string;
  cover_letter?: string;
  status: "Under Review" | "Shortlisted" | "Interview" | "Rejected" | "Hired";
  ai_score: number;
  ai_verdict: string;
  ai_summary: string;
  ai_strengths: string[];
  ai_weaknesses: string[];
  ai_interview_questions: string[];
  ai_raw_evaluation?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// In-Memory Seed Storage (acts as persistent cache/fallback when Supabase tables are being initialized)
const initialJobs: Job[] = [
  {
    id: "c900e0b0-d31c-4335-9658-3b577717feb0",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    experience: "4-6 years",
    salary: "$75,000 - $95,000",
    description:
      "Architect and ship modern cloud platforms using Next.js 16, React 19, TypeScript, and distributed database systems.",
    requirements: [
      "Expertise in Next.js, React, and TypeScript",
      "Deep understanding of SQL, Postgres, and Supabase",
      "Hands-on experience with modern AI model APIs (Gemini/OpenAI)",
      "Strong background in responsive UI and component design",
    ],
    responsibilities: [
      "Lead web application architecture and core service development",
      "Develop responsive user experiences with Radix and Tailwind",
      "Design and maintain scalable database schemas and APIs",
    ],
    status: "Active",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "7d91cf36-5f5f-4d08-b193-55de407e7347",
    title: "AI / Machine Learning Engineer",
    department: "Artificial Intelligence",
    location: "Remote / Hybrid",
    type: "Full-time",
    experience: "3-5 years",
    salary: "$85,000 - $115,000",
    description:
      "Build intelligent document parsing, candidate assessment agents, and automated reasoning pipelines using Gemini and LLM tools.",
    requirements: [
      "Proficiency with Python, TypeScript, and Google Gemini APIs",
      "Experience with RAG pipelines, vector embeddings, and LangChain",
      "Multimodal document processing and unstructured data extraction",
      "Commitment to AI safety, evaluation benchmarks, and accuracy",
    ],
    responsibilities: [
      "Build and optimize multimodal candidate evaluation engines",
      "Develop automated resume intelligence and classification models",
      "Collaborate with the frontend team to integrate real-time AI agents",
    ],
    status: "Active",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "05bc7d4f-99e1-405c-a2cb-78a6cca57e61",
    title: "Product Designer (UI/UX)",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    experience: "3-5 years",
    salary: "$55,000 - $75,000",
    description:
      "Craft world-class enterprise and candidate-facing digital experiences with extreme attention to visual fidelity, typography, and motion.",
    requirements: [
      "Expertise in Figma, design systems, tokens, and wireframing",
      "Track record designing complex B2B dashboards or web portals",
      "Working knowledge of Tailwind CSS and web layout dynamics",
      "Empathy for candidate experience and recruiting workflows",
    ],
    responsibilities: [
      "Design end-to-end user journeys for both HR admins and job seekers",
      "Maintain the design token library and component standards",
      "Conduct usability tests and iterate based on real feedback",
    ],
    status: "Active",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "24a87695-b0e5-4184-a0c4-fb3730619dbf",
    title: "HR Operations & Talent Specialist",
    department: "Human Resources",
    location: "Islamabad / On-site",
    type: "Full-time",
    experience: "2-4 years",
    salary: "$35,000 - $50,000",
    description:
      "Oversee talent acquisition pipelines, leverage AI candidate insights, and facilitate high-touch recruitment journeys.",
    requirements: [
      "Prior experience in tech recruiting or talent management",
      "Strong verbal and written communication skills",
      "Data-driven recruitment mindset with familiarity in modern ATS tools",
    ],
    responsibilities: [
      "Screen incoming applications with AI scoring support",
      "Coordinate interview schedules and candidate communications",
      "Collaborate with department leads on job opening definitions",
    ],
    status: "Active",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "569126cd-77cd-41fa-8395-3a18a5d42e85",
    title: "Cloud DevOps Architect",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    experience: "5+ years",
    salary: "$90,000 - $120,000",
    description:
      "Design, automate, and scale cloud infrastructure, CI/CD pipelines, and high-availability database replication.",
    requirements: [
      "Deep expertise with Docker, Kubernetes, Terraform, and AWS/GCP",
      "Hands-on experience with PostgreSQL high availability and Supabase",
      "Robust CI/CD automation with GitHub Actions",
    ],
    responsibilities: [
      "Manage cloud infrastructure reliability and security protocols",
      "Automate deployment pipelines and environment staging",
      "Monitor latency, uptime, and database connection pooling",
    ],
    status: "Active",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "d92382cd-0fa4-4029-abf9-240d6c6942e1",
    title: "Senior Data Analyst",
    department: "Analytics",
    location: "Hybrid / Remote",
    type: "Full-time",
    experience: "3-5 years",
    salary: "$60,000 - $80,000",
    description:
      "Transform recruitment and operations data into actionable insights, dashboards, and executive intelligence.",
    requirements: [
      "Proficiency in SQL, Postgres, Python, and data modeling",
      "Experience with modern BI visualization tools and dashboards",
      "Solid statistical foundations and conversion funnel analysis",
    ],
    responsibilities: [
      "Build ATS funnel analytics and talent acquisition dashboards",
      "Partner with leadership to identify hiring bottlenecks",
      "Model applicant conversion rates and predictive hiring timelines",
    ],
    status: "Active",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

const initialApplications: Application[] = [
  {
    id: "app-101",
    job_id: "c900e0b0-d31c-4335-9658-3b577717feb0",
    job_title: "Senior Full-Stack Engineer",
    candidate_name: "Hamza Tariq",
    candidate_email: "hamza.tariq@example.com",
    candidate_phone: "+92 300 1234567",
    candidate_linkedin: "https://linkedin.com/in/hamzatariq-dev",
    candidate_portfolio: "https://hamza.dev",
    resume_drive_url:
      "https://drive.google.com/file/d/1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU/view?usp=sharing",
    resume_drive_file_id: "1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU",
    resume_filename: "Hamza_Tariq_Resume_2026.pdf",
    cover_letter:
      "I have 5 years of full-stack engineering experience delivering scalable SaaS platforms with Next.js, TypeScript, PostgreSQL, and LLM integrations. I thrive in high-ownership teams.",
    status: "Shortlisted",
    ai_score: 94,
    ai_verdict: "Strong Fit",
    ai_summary:
      "Exceptional match for Senior Full-Stack Engineer. Hamza brings over 5 years of hands-on production experience architecting Next.js and TypeScript web applications, accompanied by extensive Postgres schema optimization. Strong leadership potential and clear articulation of software design principles.",
    ai_strengths: [
      "Extensive experience with modern Next.js 16 and React Server Components",
      "Deep Postgres and Supabase database optimization skills",
      "Strong background integrating Gemini and OpenAI APIs into enterprise workflows",
      "Clear, professional communication style in cover letter",
    ],
    ai_weaknesses: [
      "Could elaborate more on automated end-to-end testing coverage strategies",
    ],
    ai_interview_questions: [
      "Can you walk through your design process for high-concurrency Supabase subscriptions?",
      "How do you handle client vs server component boundaries in Next.js with complex state?",
      "What trade-offs do you consider when caching AI model outputs?",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "app-102",
    job_id: "7d91cf36-5f5f-4d08-b193-55de407e7347",
    job_title: "AI / Machine Learning Engineer",
    candidate_name: "Zainab Malik",
    candidate_email: "zainab.malik@example.com",
    candidate_phone: "+92 321 7654321",
    candidate_linkedin: "https://linkedin.com/in/zainab-malik-ai",
    resume_drive_url:
      "https://drive.google.com/file/d/1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU/view?usp=sharing",
    resume_drive_file_id: "1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU",
    resume_filename: "Zainab_Malik_AI_CV.pdf",
    cover_letter:
      "Passionate about multimodal document reasoning and agentic workflows. Built and deployed custom RAG architectures and automated evaluation loops.",
    status: "Interview",
    ai_score: 91,
    ai_verdict: "Strong Fit",
    ai_summary:
      "Zainab is a standout candidate for the AI/ML position. Her portfolio features practical experience with Gemini multimodal models, document semantic parsing, and evaluation benchmarks. Demonstrates strong analytical rigor.",
    ai_strengths: [
      "Demonstrated expertise with Gemini multimodal APIs and document grounding",
      "Proven RAG implementation experience with vector embeddings",
      "Strong foundation in evaluation metrics and token efficiency",
    ],
    ai_weaknesses: [
      "Limited direct experience with enterprise Kubernetes cluster deployments",
    ],
    ai_interview_questions: [
      "How do you prevent hallucinations when evaluating resumes with multimodal models?",
      "What is your strategy for handling varying document layouts (tables, multi-column PDFs)?",
      "How do you benchmark accuracy between different LLM model versions?",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: "app-103",
    job_id: "05bc7d4f-99e1-405c-a2cb-78a6cca57e61",
    job_title: "Product Designer (UI/UX)",
    candidate_name: "Bilal Ahmed",
    candidate_email: "bilal.ahmed@example.com",
    candidate_phone: "+92 333 9988776",
    candidate_linkedin: "https://linkedin.com/in/bilal-design",
    candidate_portfolio: "https://bilal.design",
    resume_drive_url:
      "https://drive.google.com/file/d/1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU/view?usp=sharing",
    resume_drive_file_id: "1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU",
    resume_filename: "Bilal_Ahmed_Product_Design.pdf",
    cover_letter:
      "4 years designing high-polish SaaS dashboards and component systems. Love translating complex multi-step workflows into effortless, delightful UI.",
    status: "Under Review",
    ai_score: 86,
    ai_verdict: "Good Fit",
    ai_summary:
      "Strong design portfolio demonstrating mastery of design systems, Figma tokens, and enterprise density. Solid grasp of front-end capabilities, making collaboration with developers seamless.",
    ai_strengths: [
      "Clean visual aesthetic and strong component hierarchy",
      "Demonstrated experience with dark mode and accessibility guidelines",
      "Strong portfolio of SaaS dashboards",
    ],
    ai_weaknesses: [
      "Fewer examples of mobile-first native applications",
    ],
    ai_interview_questions: [
      "How do you approach designing complex data tables with multiple filter criteria?",
      "Can you walk us through how you maintain a design system across rapid releases?",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "app-104",
    job_id: "24a87695-b0e5-4184-a0c4-fb3730619dbf",
    job_title: "HR Operations & Talent Specialist",
    candidate_name: "Ayesha Khan",
    candidate_email: "ayesha.khan@example.com",
    candidate_phone: "+92 345 5566778",
    candidate_linkedin: "https://linkedin.com/in/ayesha-talent",
    resume_drive_url:
      "https://drive.google.com/file/d/1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU/view?usp=sharing",
    resume_drive_file_id: "1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU",
    resume_filename: "Ayesha_Khan_HR_Resume.pdf",
    cover_letter:
      "HR specialist with 3 years managing tech hiring cycles, onboarding, and employee relations. Excited about leveraging AI to modernize the talent acquisition pipeline.",
    status: "Shortlisted",
    ai_score: 88,
    ai_verdict: "Good Fit",
    ai_summary:
      "Ayesha exhibits strong interpersonal acumen and structured recruitment operations. Demonstrated track record reducing time-to-hire while maintaining high candidate satisfaction scores.",
    ai_strengths: [
      "3+ years managing tech recruitment pipelines",
      "Enthusiastic adoption of AI scoring and automated scheduling tools",
      "Exceptional communication and candidate engagement",
    ],
    ai_weaknesses: [
      "Limited experience managing global remote contractor compliance",
    ],
    ai_interview_questions: [
      "How do you evaluate and calibrate AI screening recommendations with hiring managers?",
      "What strategies have you used to maintain high candidate response rates?",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "app-105",
    job_id: "569126cd-77cd-41fa-8395-3a18a5d42e85",
    job_title: "Cloud DevOps Architect",
    candidate_name: "Danial Raza",
    candidate_email: "danial.raza@example.com",
    candidate_phone: "+92 312 8899001",
    candidate_linkedin: "https://linkedin.com/in/danialraza-cloud",
    resume_drive_url:
      "https://drive.google.com/file/d/1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU/view?usp=sharing",
    resume_drive_file_id: "1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU",
    resume_filename: "Danial_Raza_DevOps_Resume.pdf",
    cover_letter:
      "DevOps architect with 6 years leading cloud modernization and Kubernetes deployments. Excited to streamline AI microservices infrastructure.",
    status: "Shortlisted",
    ai_score: 90,
    ai_verdict: "Strong Fit",
    ai_summary:
      "Exceptional DevOps and cloud architecture background. Strong hands-on proficiency with Terraform, container security, and Supabase / Postgres scaling. Excellent cultural and technical fit.",
    ai_strengths: [
      "6+ years cloud infrastructure and Kubernetes experience",
      "Production expertise in Postgres connection pooling and replication",
      "High standard of infrastructure-as-code and automated CI/CD",
    ],
    ai_weaknesses: [
      "Primarily focused on AWS, though adaptable to GCP",
    ],
    ai_interview_questions: [
      "How do you configure zero-downtime database migrations with Supabase?",
      "Can you describe an incident where you diagnosed a high latency spike in production?",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "app-106",
    job_id: "d92382cd-0fa4-4029-abf9-240d6c6942e1",
    job_title: "Senior Data Analyst",
    candidate_name: "Maryam Fatima",
    candidate_email: "maryam.fatima@example.com",
    candidate_phone: "+92 334 1122334",
    candidate_linkedin: "https://linkedin.com/in/maryam-analytics",
    resume_drive_url:
      "https://drive.google.com/file/d/1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU/view?usp=sharing",
    resume_drive_file_id: "1Pwcxai2LCB2JGWs8yemM2-SH4zpTwUrU",
    resume_filename: "Maryam_Fatima_Data_Analyst.pdf",
    cover_letter:
      "Data analyst specializing in recruitment metrics, pipeline attrition analysis, and executive KPI reporting. Enthusiastic about AI-driven ATS insights.",
    status: "Under Review",
    ai_score: 79,
    ai_verdict: "Moderate Fit",
    ai_summary:
      "Solid analytical capabilities with strong SQL foundations. Demonstrates good communication and data storytelling skills, with opportunities to deepen predictive modeling skills.",
    ai_strengths: [
      "Strong SQL and relational database query optimization",
      "Clear visualization style with executive dashboards",
      "Domain knowledge of HR funnel metrics",
    ],
    ai_weaknesses: [
      "Less experience with machine learning forecasting models",
    ],
    ai_interview_questions: [
      "How would you measure the impact of Gemini AI screening on overall time-to-hire?",
      "Which key metrics would you track on an executive recruiting health dashboard?",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

// Persistent runtime memory cache
const memoryStore = {
  jobs: [...initialJobs],
  applications: [...initialApplications],
  supabaseConnected: false,
};

/**
 * Fetch all job positions (queries Supabase first, falls back to memory store)
 */
export async function getJobs(): Promise<Job[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      memoryStore.supabaseConnected = true;

      // Deduplicate jobs by title so repeated database insertions never show duplicate cards in UI
      const seenTitles = new Set<string>();
      const uniqueJobs: Job[] = [];

      for (const job of data as Job[]) {
        const normalized = job.title.trim().toLowerCase();
        if (!seenTitles.has(normalized)) {
          seenTitles.add(normalized);
          uniqueJobs.push(job);
        }
      }

      // Merge any seed roles from memoryStore that may not yet exist in Supabase
      for (const initialJob of memoryStore.jobs) {
        const normalized = initialJob.title.trim().toLowerCase();
        if (!seenTitles.has(normalized)) {
          seenTitles.add(normalized);
          uniqueJobs.push(initialJob);
        }
      }

      return uniqueJobs;
    }
  } catch {
    // fallback
  }

  return memoryStore.jobs;
}

/**
 * Fetch single job by ID
 */
export async function getJobById(id: string): Promise<Job | null> {
  const jobs = await getJobs();
  return jobs.find((j) => j.id === id) || null;
}

/**
 * Fetch all applications with optional filtering
 */
export async function getApplications(filters?: {
  status?: string;
  jobId?: string;
  search?: string;
}): Promise<Application[]> {
  let apps: Application[] = [];

  try {
    let query = supabaseAdmin
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.jobId) {
      query = query.eq("job_id", filters.jobId);
    }
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      memoryStore.supabaseConnected = true;
      apps = data as Application[];
    } else {
      apps = [...memoryStore.applications];
    }
  } catch {
    apps = [...memoryStore.applications];
  }

  // Apply in-memory search filter if needed
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    apps = apps.filter(
      (a) =>
        a.candidate_name.toLowerCase().includes(term) ||
        a.candidate_email.toLowerCase().includes(term) ||
        a.job_title.toLowerCase().includes(term) ||
        a.ai_verdict.toLowerCase().includes(term),
    );
  }

  if (filters?.status && filters.status !== "all") {
    apps = apps.filter(
      (a) => a.status.toLowerCase() === filters.status?.toLowerCase(),
    );
  }

  return apps;
}

/**
 * Submit candidate application:
 * 1. Inserts into Supabase `candidates` & `applications` tables
 * 2. Caches in memory store
 */
export async function createApplication({
  jobId,
  candidateName,
  candidateEmail,
  candidatePhone,
  candidateLinkedin,
  candidatePortfolio,
  resumeDriveUrl,
  resumeDriveFileId,
  resumeFilename,
  coverLetter,
  aiEvaluation,
}: {
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateLinkedin?: string;
  candidatePortfolio?: string;
  resumeDriveUrl: string;
  resumeDriveFileId?: string;
  resumeFilename?: string;
  coverLetter?: string;
  aiEvaluation: AiEvaluationResult;
}): Promise<Application> {
  const job = (await getJobById(jobId)) || {
    id: jobId,
    title: "General Application",
  };

  const newApp: Application = {
    id: `app-${Date.now()}`,
    job_id: jobId,
    job_title: job.title,
    candidate_name: candidateName,
    candidate_email: candidateEmail,
    candidate_phone: candidatePhone || "",
    candidate_linkedin: candidateLinkedin || "",
    candidate_portfolio: candidatePortfolio || "",
    resume_drive_url: resumeDriveUrl,
    resume_drive_file_id: resumeDriveFileId || "",
    resume_filename: resumeFilename || "resume.pdf",
    cover_letter: coverLetter || "",
    status: aiEvaluation.score >= 88 ? "Shortlisted" : "Under Review",
    ai_score: aiEvaluation.score,
    ai_verdict: aiEvaluation.verdict,
    ai_summary: aiEvaluation.summary,
    ai_strengths: aiEvaluation.strengths,
    ai_weaknesses: aiEvaluation.weaknesses,
    ai_interview_questions: aiEvaluation.interviewQuestions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Attempt to persist to Supabase
  try {
    // 1. Upsert Candidate in Supabase
    const { data: candData } = await supabaseAdmin
      .from("candidates")
      .upsert(
        {
          full_name: candidateName,
          email: candidateEmail,
          phone: candidatePhone,
          linkedin: candidateLinkedin,
          portfolio: candidatePortfolio,
        },
        { onConflict: "email" },
      )
      .select("id")
      .single();

    // 2. Validate / Resolve valid UUID for job_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let validJobId: string | null = uuidRegex.test(jobId) ? jobId : null;

    if (!validJobId) {
      try {
        const { data: matchedJob } = await supabaseAdmin
          .from("jobs")
          .select("id")
          .ilike("title", job.title)
          .maybeSingle();

        if (matchedJob?.id && uuidRegex.test(matchedJob.id)) {
          validJobId = matchedJob.id;
        } else {
          const { data: firstJob } = await supabaseAdmin
            .from("jobs")
            .select("id")
            .limit(1)
            .maybeSingle();
          if (firstJob?.id && uuidRegex.test(firstJob.id)) {
            validJobId = firstJob.id;
          }
        }
      } catch (err) {
        console.warn("Could not resolve job UUID:", err);
      }
    }

    // 3. Insert Application in Supabase
    const { data: appData, error: appError } = await supabaseAdmin
      .from("applications")
      .insert({
        candidate_id: candData?.id || null,
        job_id: validJobId,
        job_title: job.title,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        candidate_phone: candidatePhone,
        candidate_linkedin: candidateLinkedin,
        candidate_portfolio: candidatePortfolio,
        resume_drive_url: resumeDriveUrl,
        resume_drive_file_id: resumeDriveFileId,
        resume_filename: resumeFilename,
        cover_letter: coverLetter,
        status: newApp.status,
        ai_score: aiEvaluation.score,
        ai_verdict: aiEvaluation.verdict,
        ai_summary: aiEvaluation.summary,
        ai_strengths: aiEvaluation.strengths,
        ai_weaknesses: aiEvaluation.weaknesses,
        ai_interview_questions: aiEvaluation.interviewQuestions,
      })
      .select()
      .single();

    if (appError) {
      console.error("Supabase applications insert error:", appError);
    } else if (appData) {
      newApp.id = appData.id;
    }
  } catch (err) {
    console.warn("Supabase insert skipped or failed:", err);
  }

  // Always update memory store
  memoryStore.applications.unshift(newApp);

  return newApp;
}

/**
 * Update candidate application status (Under Review, Shortlisted, Interview, Rejected, Hired)
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: Application["status"],
): Promise<boolean> {
  const index = memoryStore.applications.findIndex((a) => a.id === applicationId);
  if (index !== -1) {
    memoryStore.applications[index].status = newStatus;
    memoryStore.applications[index].updated_at = new Date().toISOString();
  }

  try {
    await supabaseAdmin
      .from("applications")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", applicationId);
  } catch {
    // fallback
  }

  return true;
}

/**
 * Re-evaluate candidate application with Gemini AI
 */
export async function reEvaluateApplication(
  applicationId: string,
): Promise<AiEvaluationResult | null> {
  const app = memoryStore.applications.find((a) => a.id === applicationId);
  if (!app) return null;

  const job = await getJobById(app.job_id);

  const evaluation = await evaluateCandidateWithGemini({
    candidateName: app.candidate_name,
    jobTitle: app.job_title,
    jobRequirements: job?.requirements || [],
    jobResponsibilities: job?.responsibilities || [],
    coverLetter: app.cover_letter,
  });

  app.ai_score = evaluation.score;
  app.ai_verdict = evaluation.verdict;
  app.ai_summary = evaluation.summary;
  app.ai_strengths = evaluation.strengths;
  app.ai_weaknesses = evaluation.weaknesses;
  app.ai_interview_questions = evaluation.interviewQuestions;
  app.updated_at = new Date().toISOString();

  try {
    await supabaseAdmin
      .from("applications")
      .update({
        ai_score: evaluation.score,
        ai_verdict: evaluation.verdict,
        ai_summary: evaluation.summary,
        ai_strengths: evaluation.strengths,
        ai_weaknesses: evaluation.weaknesses,
        ai_interview_questions: evaluation.interviewQuestions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);
  } catch {
    // fallback
  }

  return evaluation;
}
