import { NextRequest, NextResponse } from "next/server";
import { getApplications } from "@/lib/hr-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const jobId = searchParams.get("jobId") || undefined;
    const search = searchParams.get("search") || undefined;

    const applications = await getApplications({ status, jobId, search });
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
