import { NextRequest, NextResponse } from "next/server";
import { updateApplicationStatus, type Application } from "@/lib/hr-service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const validStatuses: Application["status"][] = ["Under Review", "Shortlisted", "Interview", "Rejected", "Hired"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value provided." }, { status: 400 });
    }

    await updateApplicationStatus(id, status);

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
