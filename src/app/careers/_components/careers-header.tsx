"use client";

import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CareersHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/careers" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight">TalentPulse AI</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-[10px] text-primary">
                HR Portal
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Autonomous Recruitment Platform</p>
          </div>
        </Link>

        <div className="flex items-center">
          <Button asChild size="sm" variant="outline" className="h-9 px-3.5 text-xs font-medium gap-1.5">
            <Link href="/dashboard/hr">
              Admin Portal
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
