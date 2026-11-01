import { NextRequest, NextResponse } from "next/server";
import { getJobs, createJob } from "@/lib/hr-service";

export async function GET() {
  try {
    const jobs = await getJobs();
    const activeJobs = jobs.filter((j) => j.status === "Active");
    return NextResponse.json({ success: true, jobs: activeJobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, department, location, type, experience, salary, description, requirements, responsibilities } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 });
    }

    const job = await createJob({
      title: title.trim(),
      department: (department || "Engineering").trim(),
      location: (location || "Remote").trim(),
      type: (type || "Full-time").trim(),
      experience: (experience || "3-5 years").trim(),
      salary: (salary || "Competitive").trim(),
      description: description.trim(),
      requirements: Array.isArray(requirements) ? requirements : [],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : ["Drive execution and architectural excellence."],
      status: "Active",
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
