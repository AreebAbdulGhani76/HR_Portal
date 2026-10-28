import { google } from "googleapis";
import { Readable } from "stream";

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET || "";
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "";
const DEFAULT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return oauth2Client;
}

export interface UploadResult {
  fileId: string;
  name: string;
  webViewLink: string;
  webContentLink?: string;
  folderId: string;
}

/**
 * Uploads candidate CV / resume directly to Google Drive.
 * Sets public view permission so HR admins can preview it seamlessly.
 */
export async function uploadResumeToGoogleDrive({
  buffer,
  filename,
  mimeType = "application/pdf",
  candidateName,
}: {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  candidateName?: string;
}): Promise<UploadResult> {
  const auth = getOAuth2Client();
  const drive = google.drive({ version: "v3", auth });

  let targetFolderId = DEFAULT_FOLDER_ID;

  // Verify folder accessibility or create one if needed
  try {
    await drive.files.get({
      fileId: targetFolderId,
      fields: "id, name",
      supportsAllDrives: true,
    });
  } catch {
    // If target folder is inaccessible, find or create HR CV folder
    try {
      const searchRes = await drive.files.list({
        q: "name = 'AI_HR_Candidate_CVs' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: "files(id, name)",
        supportsAllDrives: true,
      });

      if (searchRes.data.files && searchRes.data.files.length > 0) {
        targetFolderId = searchRes.data.files[0].id!;
      } else {
        const createFolder = await drive.files.create({
          requestBody: {
            name: "AI_HR_Candidate_CVs",
            mimeType: "application/vnd.google-apps.folder",
          },
          fields: "id, name",
        });
        targetFolderId = createFolder.data.id!;
      }
    } catch (e) {
      console.warn("Could not retrieve/create folder, falling back to root:", e);
      targetFolderId = "";
    }
  }

  // Format clean filename: [Candidate Name] - [Original Filename]
  const cleanName = candidateName
    ? `${candidateName.replace(/[^a-zA-Z0-9_-]/g, "_")}_CV_${filename}`
    : `CV_${filename}`;

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const requestBody: { name: string; parents?: string[] } = {
    name: cleanName,
  };
  if (targetFolderId) {
    requestBody.parents = [targetFolderId];
  }

  const uploadRes = await drive.files.create({
    requestBody,
    media: {
      mimeType: mimeType || "application/octet-stream",
      body: stream,
    },
    fields: "id, name, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  const fileId = uploadRes.data.id!;
  const webViewLink =
    uploadRes.data.webViewLink ||
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  const webContentLink =
    uploadRes.data.webContentLink ||
    `https://drive.google.com/uc?id=${fileId}&export=download`;

  // Make file viewable by anyone with link
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  } catch (permErr) {
    console.warn("Failed to set public reader permission on Drive file:", permErr);
  }

  return {
    fileId,
    name: cleanName,
    webViewLink,
    webContentLink,
    folderId: targetFolderId,
  };
}
