"use client";

import * as React from "react";

import { ArrowRight, Briefcase, Clock, DollarSign, MapPin, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Job } from "@/lib/hr-service";

import { ApplyModal } from "./apply-modal";
import { CareersHeader } from "./careers-header";

export function CareersView({ initialJobs = [] }: { initialJobs?: Job[] }) {
  const [jobs, setJobs] = React.useState<Job[]>(initialJobs);
  const [search, setSearch] = React.useState("");
  const [selectedDepartment, setSelectedDepartment] = React.useState("all");

  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/careers/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      })
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  const departments = React.useMemo(() => {
    const set = new Set(jobs.map((j) => j.department));
    return ["all", ...Array.from(set)];
  }, [jobs]);

  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const matchesDept =
        selectedDepartment === "all" || job.department.toLowerCase() === selectedDepartment.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.department.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [jobs, search, selectedDepartment]);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <CareersHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background py-14 sm:py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 relative text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Find Your Next Career Step with{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              AI-First Evaluation
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground text-balance">
            Explore open opportunities across engineering, artificial intelligence, product design, and operations.
            Submit your CV for instant profile matching.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl border bg-card/90 shadow-lg backdrop-blur-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search job title, skill, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 border-none shadow-none focus-visible:ring-0 bg-transparent text-sm"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="h-11 rounded-lg border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings Grid */}
      <section className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Open Opportunities</h2>
              <p className="text-xs text-muted-foreground">
                Showing {filteredJobs.length} active position{filteredJobs.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {jobs.length} Total Openings
              </Badge>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
              <Briefcase className="size-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-base">No open positions found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Try clearing your search query or choosing another department.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setSelectedDepartment("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-primary/40 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 text-xs font-normal"
                      >
                        {job.department}
                      </Badge>
                      <Badge variant="secondary" className="text-[11px]">
                        {job.type}
                      </Badge>
                    </div>

                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors mt-2">
                      {job.title}
                    </CardTitle>

                    <CardDescription className="line-clamp-2 text-xs mt-1">{job.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1 justify-between space-y-4 pt-0">
                    <div className="space-y-3">
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

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {job.requirements.slice(0, 3).map((req, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium truncate max-w-[220px]"
                            >
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t mt-auto flex items-center justify-center">
                      <Button size="sm" onClick={() => handleApply(job)} className="gap-1.5 text-xs font-medium px-5">
                        View &amp; Apply
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 TalentPulse HR Portal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/dashboard/hr" className="hover:text-foreground transition-colors">
              HR Admin Dashboard
            </a>
          </div>
        </div>
      </footer>

      <ApplyModal
        job={selectedJob}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          // Success callback
        }}
      />
    </div>
  );
}
