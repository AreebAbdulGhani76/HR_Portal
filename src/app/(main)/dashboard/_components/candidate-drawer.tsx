"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Loader2,
  Calendar,
} from "lucide-react";
import type { Application } from "@/lib/hr-service";

interface CandidateDrawerProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, status: Application["status"]) => void;
  onReEvaluated?: (app: Application) => void;
}

export function CandidateDrawer({
  application,
  open,
  onOpenChange,
  onStatusChange,
  onReEvaluated,
}: CandidateDrawerProps) {
  const [currentApp, setCurrentApp] = React.useState<Application | null>(application);
  const [evaluating, setEvaluating] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);

  React.useEffect(() => {
    setCurrentApp(application);
  }, [application]);

  if (!currentApp) return null;

  const handleStatusUpdate = async (newStatus: Application["status"]) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/candidates/${currentApp.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = { ...currentApp, status: newStatus };
        setCurrentApp(updated);
        onStatusChange?.(currentApp.id, newStatus);
      }
    } catch (e) {
      console.error("Status update failed:", e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`/api/admin/candidates/${currentApp.id}/evaluate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        const updated: Application = {
          ...currentApp,
          ai_score: data.evaluation.score,
          ai_verdict: data.evaluation.verdict,
          ai_summary: data.evaluation.summary,
          ai_strengths: data.evaluation.strengths,
          ai_weaknesses: data.evaluation.weaknesses,
          ai_interview_questions: data.evaluation.interviewQuestions,
        };
        setCurrentApp(updated);
        onReEvaluated?.(updated);
      }
    } catch (e) {
      console.error("Re-evaluation failed:", e);
    } finally {
      setEvaluating(false);
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 88) return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400";
    if (score >= 75) return "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400";
    if (score >= 60) return "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400";
    return "bg-rose-500/15 text-rose-600 border-rose-500/30 dark:text-rose-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold">{currentApp.candidate_name}</DialogTitle>
                <Badge variant="outline" className={`font-semibold text-xs ${getScoreBadgeClass(currentApp.ai_score)}`}>
                  <Sparkles className="size-3 mr-1" />
                  {currentApp.ai_score}% Match • {currentApp.ai_verdict}
                </Badge>
              </div>
              <DialogDescription className="text-xs pt-1 flex items-center gap-3">
                <span className="font-medium text-foreground">{currentApp.job_title}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3" />
                  Applied {new Date(currentApp.created_at).toLocaleDateString()}
                </span>
              </DialogDescription>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5">
              {(["Under Review", "Shortlisted", "Interview", "Hired", "Rejected"] as const).map((st) => (
                <Button
                  key={st}
                  size="xs"
                  variant={currentApp.status === st ? "default" : "outline"}
                  disabled={updatingStatus}
                  onClick={() => handleStatusUpdate(st)}
                  className="text-[11px] h-7 px-2.5"
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Contact & Drive CV Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 rounded-xl border bg-muted/30 p-3.5 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground truncate">
              <Mail className="size-3.5 text-primary shrink-0" />
              <a href={`mailto:${currentApp.candidate_email}`} className="hover:underline truncate">
                {currentApp.candidate_email}
              </a>
            </div>

            {currentApp.candidate_phone ? (
              <div className="flex items-center gap-2 text-muted-foreground truncate">
                <Phone className="size-3.5 text-primary shrink-0" />
                <span>{currentApp.candidate_phone}</span>
              </div>
            ) : (
              <div className="text-muted-foreground/60 italic">No phone provided</div>
            )}

            {currentApp.candidate_linkedin ? (
              <div className="flex items-center gap-2 text-muted-foreground truncate">
                <Globe className="size-3.5 text-primary shrink-0" />
                <a
                  href={currentApp.candidate_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline truncate"
                >
                  LinkedIn Profile
                </a>
              </div>
            ) : (
              <div className="text-muted-foreground/60 italic">No LinkedIn</div>
            )}

            {currentApp.resume_drive_url ? (
              <div className="flex items-center gap-2 truncate">
                <FileText className="size-3.5 text-emerald-500 shrink-0" />
                <a
                  href={currentApp.resume_drive_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Resume / CV <ExternalLink className="size-3" />
                </a>
              </div>
            ) : (
              <div className="text-muted-foreground/60 italic">No File Uploaded</div>
            )}
          </div>

          {/* Cover Letter Section */}
          {currentApp.cover_letter && (
            <div className="space-y-1.5">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Candidate Note / Cover Letter
              </h4>
              <p className="rounded-xl border bg-card p-3.5 text-xs leading-relaxed text-muted-foreground italic">
                "{currentApp.cover_letter}"
              </p>
            </div>
          )}

          {/* Candidate Evaluation Panel */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-card to-card p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Autonomous Profile Evaluation</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Deep multi-criteria alignment against role requirements
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleReEvaluate}
                disabled={evaluating}
                className="gap-1.5 text-xs h-8"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-3.5" />
                    Re-evaluate AI
                  </>
                )}
              </Button>
            </div>

            {/* AI Summary */}
            <div className="space-y-1.5">
              <p className="font-medium text-xs text-foreground">Recruiter Executive Summary</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{currentApp.ai_summary}</p>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="rounded-xl border bg-background/80 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span>Candidate Strengths & Matches</span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {currentApp.ai_strengths?.map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="size-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border bg-background/80 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-4" />
                  <span>Gaps & Attention Points</span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {currentApp.ai_weaknesses && currentApp.ai_weaknesses.length > 0 ? (
                    currentApp.ai_weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="size-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground italic">No critical gaps detected.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* AI Custom Interview Questions */}
            {currentApp.ai_interview_questions && currentApp.ai_interview_questions.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <HelpCircle className="size-4" />
                  <span>AI Recommended Tailored Interview Questions</span>
                </div>
                <div className="space-y-2">
                  {currentApp.ai_interview_questions.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg border bg-background/50 p-2.5 text-xs text-muted-foreground"
                    >
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
