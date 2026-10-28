"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  FileText,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateDrawer } from "../_components/candidate-drawer";
import type { Application } from "@/lib/hr-service";

export default function CandidatesPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [minScore, setMinScore] = React.useState<number>(0);

  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/candidates");
      const data = await res.json();
      if (data.success && data.applications) {
        setApplications(data.applications);
      }
    } catch (e) {
      console.error("Failed to fetch candidates:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCandidates();
  }, []);

  const roles = React.useMemo(() => {
    const set = new Set(applications.map((a) => a.job_title));
    return ["all", ...Array.from(set)];
  }, [applications]);

  const filtered = React.useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesRole = roleFilter === "all" || app.job_title.toLowerCase() === roleFilter.toLowerCase();
      const matchesScore = app.ai_score >= minScore;
      const term = search.toLowerCase();
      const matchesSearch =
        !search ||
        app.candidate_name.toLowerCase().includes(term) ||
        app.candidate_email.toLowerCase().includes(term) ||
        app.job_title.toLowerCase().includes(term);

      return matchesStatus && matchesRole && matchesScore && matchesSearch;
    });
  }, [applications, statusFilter, roleFilter, minScore, search]);

  const handleInspect = (app: Application) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidate Pipeline &amp; Evaluation</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track, screen, and review qualified applicants across all active career opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchCandidates}
            disabled={loading}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs h-8">
            <Link href="/careers" target="_blank" rel="noreferrer">
              Public Portal
              <ExternalLink className="size-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Interactive Search & Filter Toolbar (Harmonized Design) */}
      <div className="rounded-2xl border bg-card p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name, role, email, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-input text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-10 rounded-xl px-3.5 text-xs bg-background border-input min-w-[130px] font-medium shadow-2xs">
                <SelectValue placeholder={`All Roles (${roles.length - 1 > 0 ? roles.length - 1 : 6})`} />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                <SelectItem value="all" className="text-xs">
                  All Roles ({roles.length - 1 > 0 ? roles.length - 1 : 6})
                </SelectItem>
                {roles
                  .filter((r) => r !== "all")
                  .map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

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

            <Select
              value={minScore === 88 ? "top" : minScore === 75 ? "moderate" : "all"}
              onValueChange={(val) => {
                if (val === "top") setMinScore(88);
                else if (val === "moderate") setMinScore(75);
                else setMinScore(0);
              }}
            >
              <SelectTrigger className="h-10 rounded-xl px-3.5 text-xs bg-background border-input min-w-[125px] font-medium shadow-2xs">
                <SelectValue placeholder="All Match Scores" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                <SelectItem value="all" className="text-xs">
                  All Match Scores
                </SelectItem>
                <SelectItem value="top" className="text-xs">
                  Top Talent (&ge; 88%)
                </SelectItem>
                <SelectItem value="moderate" className="text-xs">
                  Moderate Fit (75% - 87%)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Candidates Table */}
      <Card className="shadow-2xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Applicants ({filtered.length})</CardTitle>
            <CardDescription className="text-xs">
              Click any candidate row to view comprehensive qualification score and tailored interview questions
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y bg-muted/40 text-muted-foreground font-medium">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Applied Role</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Resume / CV</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No candidates match the specified filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => handleInspect(app)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase shrink-0">
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

                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {app.resume_drive_url ? (
                          <a
                            href={app.resume_drive_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <FileText className="size-3.5" />
                            <span>Preview</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            app.ai_score >= 88
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 font-semibold"
                              : app.ai_score >= 75
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400 font-semibold"
                                : "bg-muted text-muted-foreground font-semibold"
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
