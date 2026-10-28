import { NextRequest, NextResponse } from "next/server";
import { reEvaluateApplication } from "@/lib/hr-service";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const evaluation = await reEvaluateApplication(id);

    if (!evaluation) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      evaluation,
      message: "Candidate re-evaluated successfully with Gemini AI.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
