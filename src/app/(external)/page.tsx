import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowRight, Briefcase, ShieldCheck, Users, Bot, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "TalentPulse AI — Autonomous Recruitment & Talent Intelligence Engine",
  description:
    "Enterprise-grade agentic HR platform featuring multi-agent screening, ethical safety gates, and Human-in-the-Loop governance.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span>TalentPulse AI</span>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/careers">Candidate Portal</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard/hr">
                HR Command Center
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 border-primary/30 bg-primary/5 text-primary">
          <Bot className="size-3.5" />
          Autonomous Agentic Recruitment Operating System
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          High-Velocity Hiring with <span className="text-primary">Agentic Intelligence</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Screen resumes, extract deep qualification insights, and coordinate multi-agent evaluation pipelines with
          strict safety gates and human-in-the-loop oversight.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button asChild size="lg" className="gap-2 text-sm h-11 px-6 shadow-md shadow-primary/20">
            <Link href="/dashboard/hr">
              Open HR Dashboard
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2 text-sm h-11 px-6">
            <Link href="/careers">
              <Briefcase className="size-4" />
              Explore Open Positions
            </Link>
          </Button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-14">
          <div className="rounded-2xl border bg-card p-5 space-y-2.5 shadow-2xs">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="size-5" />
            </div>
            <h3 className="font-semibold text-sm">Autonomous Multi-Agent Evaluation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gemini-powered agents parse resumes, analyze alignment against role rubrics, and generate custom interview
              questions.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-2.5 shadow-2xs">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="font-semibold text-sm">Ethical Safety Gates</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PII redaction, anti-bias audits, and salary equity boundaries guarantee fair and compliant talent
              selection.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-2.5 shadow-2xs">
            <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <h3 className="font-semibold text-sm">Human-in-the-Loop Triage</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ambiguous scores and borderline matches escalate directly to human recruiters with transparent rationale.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} TalentPulse AI. Open-source recruitment portal.</span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/hr" className="hover:text-foreground transition-colors">
              HR Dashboard
            </Link>
            <Link href="/careers" className="hover:text-foreground transition-colors">
              Careers Portal
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
