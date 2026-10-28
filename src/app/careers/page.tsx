import type { Metadata } from "next";
import { getJobs } from "@/lib/hr-service";
import { CareersView } from "./_components/careers-view";

export const metadata: Metadata = {
  title: "Careers & Open Positions | TalentPulse AI HR Portal",
  description:
    "Explore open opportunities across engineering, artificial intelligence, product design, and operations. Submit your CV for instant profile matching.",
};

export default async function CareersPage() {
  const jobs = await getJobs();
  const activeJobs = jobs.filter((j) => j.status === "Active");

  return <CareersView initialJobs={activeJobs} />;
}
