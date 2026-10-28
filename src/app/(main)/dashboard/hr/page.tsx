"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Sparkles,
  TrendingUp,
  ExternalLink,
  FileText,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateDrawer } from "../_components/candidate-drawer";
import type { Application, Job } from "@/lib/hr-service";

export default function HrDashboardPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [scoreFilter, setScoreFilter] = React.useState("all");

  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, jobRes] = await Promise.all([fetch("/api/admin/candidates"), fetch("/api/careers/jobs")]);
      const appData = await appRes.json();
      const jobData = await jobRes.json();

      if (appData.success && appData.applications) {
        setApplications(appData.applications);
      }
      if (jobData.success && jobData.jobs) {
        setJobs(jobData.jobs);
      }
    } catch (e) {
      console.error("Failed to load HR dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics matching the exact user layout
  const totalCandidates = applications.length;
  const strongHiresCount = applications.filter((a) => (a.ai_score || 0) >= 88).length;
  const avgScore =
    applications.length > 0
      ? Math.round(applications.reduce((acc, a) => acc + (a.ai_score || 0), 0) / applications.length)
      : 88;
  const pendingReviewsCount = applications.filter((a) => a.status === "Under Review").length;

  // Unique roles across jobs & applications
  const roles = React.useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => set.add(j.title));
    applications.forEach((a) => set.add(a.job_title));
    return Array.from(set);
  }, [jobs, applications]);

  // Filtered applications based on search + role + status + score filters
  const filteredApps = React.useMemo(() => {
    return applications.filter((app) => {
      if (roleFilter !== "all" && app.job_title.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== "all" && app.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (scoreFilter === "top" && (app.ai_score || 0) < 88) return false;
      if (scoreFilter === "moderate" && ((app.ai_score || 0) < 75 || (app.ai_score || 0) >= 88)) return false;
      if (scoreFilter === "low" && (app.ai_score || 0) >= 75) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const inSkills = app.ai_strengths?.some((s) => s.toLowerCase().includes(term));
      return (
        app.candidate_name.toLowerCase().includes(term) ||
        app.candidate_email.toLowerCase().includes(term) ||
        app.job_title.toLowerCase().includes(term) ||
        app.status.toLowerCase().includes(term) ||
        Boolean(inSkills)
      );
    });
  }, [applications, roleFilter, statusFilter, scoreFilter, search]);

  const handleInspect = (app: Application) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI HR Recruitment Dashboard</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchData} disabled={loading} className="gap-1.5 text-xs h-9">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button asChild size="sm" className="gap-1.5 text-xs h-9">
            <Link href="/careers" target="_blank" rel="noreferrer">
              Candidate Portal
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Executive KPI Cards Row (Exact Design Match) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL APPLICANTS */}
        <div className="rounded-2xl border bg-card p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                TOTAL APPLICANTS
              </p>
              <div className="text-3xl font-bold tracking-tight text-foreground">{totalCandidates}</div>
              <p className="text-xs text-muted-foreground">Across all open positions</p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="size-6" />
            </div>
          </div>
        </div>

        {/* STRONG HIRES (TOP TALENT) */}
        <div className="rounded-2xl border bg-card p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                STRONG HIRES (TOP TALENT)
              </p>
              <div className="text-3xl font-bold tracking-tight text-foreground">{strongHiresCount}</div>
              <p className="text-xs text-muted-foreground">Score &ge; 88 / 100</p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Award className="size-6" />
            </div>
          </div>
        </div>

        {/* AVG MATCH SCORE */}
        <div className="rounded-2xl border bg-card p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                AVG MATCH SCORE
              </p>
              <div className="text-3xl font-bold tracking-tight text-foreground">{avgScore}%</div>
              <p className="text-xs text-muted-foreground">Across all evaluated roles</p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Sparkles className="size-6" />
            </div>
          </div>
        </div>

        {/* PENDING REVIEWS */}
        <div className="rounded-2xl border bg-card p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                PENDING REVIEWS
              </p>
              <div className="text-3xl font-bold tracking-tight text-foreground">{pendingReviewsCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting recruiter decision</p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Search & Filter Toolbar (Exact Match to Screenshot) */}
      <div className="rounded-2xl border bg-card p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search input with leading icon */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name, role, email, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-input text-xs sm:text-sm"
            />
          </div>

          {/* Three Dropdown Selects */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* All Roles */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-10 rounded-xl px-3.5 text-xs bg-background border-input min-w-[130px] font-medium shadow-2xs">
                <SelectValue placeholder={`All Roles (${roles.length || 6})`} />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                <SelectItem value="all" className="text-xs">
                  All Roles ({roles.length || 6})
                </SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* All Statuses */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-xl px-3.5 text-xs bg-background border-input min-w-[125px] font-medium shadow-2xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                <SelectItem value="all" className="text-xs">
                  All Statuses
                </SelectItem>
                <SelectItem value="Under Review" className="text-xs">
                  Under Review
                </SelectItem>
                <SelectItem value="Shortlisted" className="text-xs">
                  Shortlisted
                </SelectItem>
                <SelectItem value="Interview" className="text-xs">
                  Interview
                </SelectItem>
                <SelectItem value="Hired" className="text-xs">
                  Hired
                </SelectItem>
                <SelectItem value="Rejected" className="text-xs">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>

            {/* All AI Scores */}
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="h-10 rounded-xl px-3.5 text-xs bg-background border-input min-w-[125px] font-medium shadow-2xs">
                <SelectValue placeholder="All AI Scores" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                <SelectItem value="all" className="text-xs">
                  All AI Scores
                </SelectItem>
                <SelectItem value="top" className="text-xs">
                  Top Talent (&ge; 88%)
                </SelectItem>
                <SelectItem value="moderate" className="text-xs">
                  Moderate Fit (75% - 87%)
                </SelectItem>
                <SelectItem value="low" className="text-xs">
                  Low Fit (&lt; 75%)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Candidates ATS Table */}
      <Card className="rounded-2xl shadow-2xs overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">Candidate Applications</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Showing {filteredApps.length} of {applications.length} candidates
              </CardDescription>
            </div>

            <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg">
              <Link href="/dashboard/candidates">
                View Full ATS Table
                <ExternalLink className="size-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y bg-muted/40 text-muted-foreground font-medium">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Applied Position</th>
                  <th className="py-3 px-4">Resume / CV</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No candidate applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => handleInspect(app)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                            {app.candidate_name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {app.candidate_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{app.candidate_email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium">{app.job_title}</td>

                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {app.resume_drive_url ? (
                          <a
                            href={app.resume_drive_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <FileText className="size-3.5" />
                            <span>Preview in Drive</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            app.ai_score >= 88
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                              : app.ai_score >= 75
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          <Sparkles className="size-3 mr-1" />
                          {app.ai_score}% • {app.ai_verdict}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={
                            app.status === "Shortlisted"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : app.status === "Interview"
                                ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                                : app.status === "Hired"
                                  ? "bg-emerald-600 text-white"
                                  : app.status === "Rejected"
                                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                    : "bg-muted text-muted-foreground"
                          }
                        >
                          {app.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleInspect(app)}
                          className="text-xs h-7 gap-1"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Inspection Drawer */}
      <CandidateDrawer
        application={selectedApp}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onStatusChange={(id, st) => {
          setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: st } : a)));
        }}
        onReEvaluated={(updated) => {
          setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        }}
      />
    </div>
  );
}
