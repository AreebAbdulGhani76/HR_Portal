"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  Users,
  ExternalLink,
  Search,
  Building,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Job, Application } from "@/lib/hr-service";

export default function JobsManagementPage() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState("Engineering");
  const [location, setLocation] = React.useState("Remote");
  const [type, setType] = React.useState("Full-time");
  const [experience, setExperience] = React.useState("3-5 years");
  const [salary, setSalary] = React.useState("$70,000 - $90,000");
  const [description, setDescription] = React.useState("");
  const [requirementsStr, setRequirementsStr] = React.useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([fetch("/api/careers/jobs"), fetch("/api/admin/candidates")]);
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();

      if (jobsData.success && jobsData.jobs) setJobs(jobsData.jobs);
      if (appsData.success && appsData.applications) setApplications(appsData.applications);
    } catch (e) {
      console.error("Failed to load jobs data:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const applicantCountByJob = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const app of applications) {
      map[app.job_id] = (map[app.job_id] || 0) + 1;
    }
    return map;
  }, [applications]);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title,
      department,
      location,
      type,
      experience,
      salary,
      description,
      requirements: requirementsStr
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
      responsibilities: ["Drive execution and architectural excellence."],
      status: "Active",
      created_at: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);
    setCreateModalOpen(false);

    // Reset form
    setTitle("");
    setDescription("");
    setRequirementsStr("");
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Openings Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Define role requirements and evaluation criteria to match top talent across active departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5 text-xs h-8">
            <Plus className="size-3.5" />
            Post New Position
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs h-8">
            <Link href="/careers" target="_blank" rel="noreferrer">
              View Public Portal
              <ExternalLink className="size-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Filter positions by title, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8.5 h-8.5 text-xs"
        />
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredJobs.map((job) => {
          const count = applicantCountByJob[job.id] || 0;
          return (
            <Card key={job.id} className="shadow-2xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal">
                    {job.department}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[11px]">
                      {job.type}
                    </Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 text-[11px]">
                      {job.status}
                    </Badge>
                  </div>
                </div>

                <CardTitle className="text-lg font-bold mt-2">{job.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">{job.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-primary/70" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="size-3.5 text-emerald-500" />
                    {job.salary}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5 text-indigo-400" />
                    {job.experience}
                  </span>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-3.5 text-primary" />
                    <span className="font-semibold text-foreground">{count}</span>
                    <span>applicant{count === 1 ? "" : "s"} evaluated</span>
                  </div>

                  <Button asChild size="xs" variant="outline" className="text-xs h-7">
                    <Link href={`/dashboard/candidates?role=${encodeURIComponent(job.title)}`}>Review Candidates</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Post Position Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Create New Job Opening</DialogTitle>
            <DialogDescription className="text-xs">
              This position will immediately appear on the Candidate Portal for candidate submissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateJob} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">
                Position Title
              </Label>
              <Input
                id="title"
                placeholder="e.g. Lead Machine Learning Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dept" className="text-xs">
                  Department
                </Label>
                <Input id="dept" value={department} onChange={(e) => setDepartment(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loc" className="text-xs">
                  Location
                </Label>
                <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs">
                  Employment Type
                </Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp" className="text-xs">
                  Experience
                </Label>
                <Input id="exp" value={experience} onChange={(e) => setExperience(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sal" className="text-xs">
                  Salary Range
                </Label>
                <Input id="sal" value={salary} onChange={(e) => setSalary(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs">
                Role Description
              </Label>
              <Textarea
                id="desc"
                rows={3}
                placeholder="Describe role mission and day-to-day context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reqs" className="text-xs">
                Key Requirements (One per line - used for candidate matching)
              </Label>
              <Textarea
                id="reqs"
                rows={3}
                placeholder="Next.js 16 and React 19&#10;Supabase & Postgres design&#10;AI API integration experience"
                value={requirementsStr}
                onChange={(e) => setRequirementsStr(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Opening</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
