import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
export const cloudinaryConfigured = () => Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

/** Only accept image URLs that really live in OUR Cloudinary account and the folder we sign. */
export const isOurImageUrl = (url: string) => cloudName !== "" && url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`);
export const isOurPublicId = (id: string) => /^sakthi\/(projects|gallery)\/[\w-]+$/.test(id);

export const UPLOAD_FOLDERS = { projects: "sakthi/projects", gallery: "sakthi/gallery" } as const;
export type UploadKind = keyof typeof UPLOAD_FOLDERS;

/** Signature for a direct browser -> Cloudinary upload. The API secret never leaves the server. */
export function signUpload(kind: UploadKind) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = UPLOAD_FOLDERS[kind];
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, process.env.CLOUDINARY_API_SECRET as string);
  return { cloudName, apiKey: process.env.CLOUDINARY_API_KEY as string, timestamp, folder, signature };
}

export async function destroyImage(publicId: string): Promise<void> {
  try {
    if (isOurPublicId(publicId)) await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  } catch (e) {
    console.error("Cloudinary delete failed", e instanceof Error ? e.message : e);
  }
}

/** Customer attachments are stored as *authenticated* assets (not publicly guessable) and viewed via signed URLs. */
export function uploadAttachment(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "sakthi/enquiries", resource_type: "auto", type: "authenticated" }, (err, res) => {
      if (err || !res) reject(err ?? new Error("Upload failed"));
      else resolve(res);
    });
    stream.end(buffer);
  });
}

export function signedAttachmentUrl(publicId: string, resourceType: string, fileName?: string | null): string {
  const ext = fileName?.includes(".") ? fileName.split(".").pop()!.toLowerCase() : undefined;
  return cloudinary.url(publicId, {
    resource_type: (resourceType === "raw" ? "raw" : "image"), type: "authenticated", sign_url: true, secure: true,
    ...(resourceType !== "raw" && ext ? { format: ext } : {}),
  });
}
