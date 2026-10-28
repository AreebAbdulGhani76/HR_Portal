import { NextResponse } from "next/server";
import { getJobs } from "@/lib/hr-service";

export async function GET() {
  try {
    const jobs = await getJobs();
    const activeJobs = jobs.filter((j) => j.status === "Active");
    return NextResponse.json({ success: true, jobs: activeJobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
