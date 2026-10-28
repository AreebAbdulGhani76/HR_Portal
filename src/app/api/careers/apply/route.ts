import { NextRequest, NextResponse } from "next/server";
import { uploadResumeToGoogleDrive } from "@/lib/google-drive";
import { evaluateCandidateWithGemini } from "@/lib/gemini-ai";
import { createApplication, getJobById } from "@/lib/hr-service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const jobId = (formData.get("jobId") as string) || "c900e0b0-d31c-4335-9658-3b577717feb0";
    const candidateName = (formData.get("name") as string)?.trim();
    const candidateEmail = (formData.get("email") as string)?.trim();
    const candidatePhone = (formData.get("phone") as string)?.trim() || "";
    const candidateLinkedin = (formData.get("linkedin") as string)?.trim() || "";
    const candidatePortfolio = (formData.get("portfolio") as string)?.trim() || "";
    const coverLetter = (formData.get("coverLetter") as string)?.trim() || "";
    const cvFile = formData.get("cv") as File | null;

    if (!candidateName || !candidateEmail) {
      return NextResponse.json({ success: false, error: "Candidate name and email are required." }, { status: 400 });
    }

    if (!cvFile || typeof cvFile === "string") {
      return NextResponse.json(
        { success: false, error: "A valid CV / Resume file must be uploaded." },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = cvFile.name || "resume.pdf";
    const mimeType = cvFile.type || "application/pdf";

    // 1. Upload CV directly to Google Drive
    let driveUrl = "";
    let driveFileId = "";

    try {
      const driveUpload = await uploadResumeToGoogleDrive({
        buffer,
        filename,
        mimeType,
        candidateName,
      });
      driveUrl = driveUpload.webViewLink;
      driveFileId = driveUpload.fileId;
    } catch (driveErr) {
      console.error("Google Drive upload error:", driveErr);
      // Fallback placeholder if Drive fails
      driveUrl = `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_FOLDER_ID}`;
    }

    // 2. Fetch Job details for AI evaluation context
    const job = await getJobById(jobId);

    // 3. Evaluate candidate CV with Gemini AI model
    const aiEvaluation = await evaluateCandidateWithGemini({
      candidateName,
      jobTitle: job?.title || "Candidate Position",
      jobRequirements: job?.requirements || [],
      jobResponsibilities: job?.responsibilities || [],
      coverLetter,
      buffer,
      mimeType,
    });

    // 4. Save Candidate and Application in Supabase
    const application = await createApplication({
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      candidateLinkedin,
      candidatePortfolio,
      resumeDriveUrl: driveUrl,
      resumeDriveFileId: driveFileId,
      resumeFilename: filename,
      coverLetter,
      aiEvaluation,
    });

    return NextResponse.json({
      success: true,
      application,
      message: "Application submitted successfully and evaluated by Gemini AI.",
    });
  } catch (error) {
    console.error("Application submission failed:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Submission failed" },
      { status: 500 },
    );
  }
}
