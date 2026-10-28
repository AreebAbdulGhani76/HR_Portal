"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
} from "lucide-react";
import type { Job, Application } from "@/lib/hr-service";

interface ApplyModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (app: Application) => void;
}

export function ApplyModal({ job, open, onOpenChange, onSuccess }: ApplyModalProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [portfolio, setPortfolio] = React.useState("");
  const [coverLetter, setCoverLetter] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [stepMessage, setStepMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [submittedApp, setSubmittedApp] = React.useState<Application | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      // Reset form on close after a brief delay
      setTimeout(() => {
        setName("");
        setEmail("");
        setPhone("");
        setLinkedin("");
        setPortfolio("");
        setCoverLetter("");
        setFile(null);
        setError("");
        setSubmittedApp(null);
        setStepMessage("");
      }, 300);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Please provide your full name and email address.");
      return;
    }
    if (!file) {
      setError("Please attach your CV / Resume document (PDF, DOCX, or TXT).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      setStepMessage("1/3 Uploading resume securely...");

      const formData = new FormData();
      formData.append("jobId", job?.id || "c900e0b0-d31c-4335-9658-3b577717feb0");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("linkedin", linkedin);
      formData.append("portfolio", portfolio);
      formData.append("coverLetter", coverLetter);
      formData.append("cv", file);

      // Transition message for UI feedback
      const timer = setTimeout(() => {
        setStepMessage("2/3 Evaluating qualification profile...");
      }, 1500);

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: formData,
      });

      clearTimeout(timer);
      setStepMessage("3/3 Finalizing application record...");

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Application submission failed.");
      }

      setSubmittedApp(data.application);
      onSuccess?.(data.application);
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {job.department}
            </Badge>
            <Badge variant="secondary">{job.type}</Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl mt-1.5">{job.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 text-muted-foreground" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <DollarSign className="size-3.5 text-muted-foreground" />
              {job.salary}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5 text-muted-foreground" />
              {job.experience}
            </span>
          </DialogDescription>
        </DialogHeader>

        {submittedApp ? (
          <div className="space-y-5 py-4">
            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="mt-3 font-semibold text-lg text-emerald-950 dark:text-emerald-100">
                Application Received Successfully!
              </h3>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Your application has been received and indexed. Initial qualification screening is complete.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span className="font-semibold text-sm">Profile Assessment Preview</span>
                </div>
                <Badge
                  className={
                    submittedApp.ai_score >= 85
                      ? "bg-emerald-600 text-white"
                      : submittedApp.ai_score >= 70
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground"
                  }
                >
                  {submittedApp.ai_score}% • {submittedApp.ai_verdict}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{submittedApp.ai_summary}</p>

              <div className="pt-2">
                <p className="font-medium text-xs mb-1.5">Identified Candidate Strengths:</p>
                <div className="flex flex-wrap gap-1.5">
                  {submittedApp.ai_strengths?.map((strength, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary/70 px-2 py-0.5 text-[11px] text-foreground"
                    >
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              {submittedApp.resume_drive_url && (
                <div className="pt-3 border-t flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" />
                    Uploaded Resume File
                  </span>
                  <a
                    href={submittedApp.resume_drive_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    View Document <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="linkedin" className="text-xs">
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="portfolio" className="text-xs">
                  Portfolio / GitHub
                </Label>
                <Input
                  id="portfolio"
                  placeholder="https://github.com/..."
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* CV / Resume Upload Box */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Upload CV / Resume <span className="text-destructive">*</span>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                  file ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <FileText className="size-8 text-primary" />
                    <p className="font-medium text-xs text-foreground">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • Click to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UploadCloud className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Click to upload or drag & drop your CV</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">PDF, DOCX, or TXT up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coverLetter" className="text-xs">
                Cover Note / Key Highlights
              </Label>
              <Textarea
                id="coverLetter"
                rows={3}
                placeholder="Briefly highlight relevant achievements or why you are a great fit..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                disabled={loading}
              />
            </div>

            {loading && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{stepMessage}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                Evaluated autonomously against role criteria
              </span>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      Processing...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
