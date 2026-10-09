import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinaryConfigured, signUpload, UPLOAD_FOLDERS, type UploadKind } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!cloudinaryConfigured()) return NextResponse.json({ error: "cloudinary_not_configured" }, { status: 500 });
  const body = (await req.json().catch(() => ({}))) as { kind?: string };
  if (!body.kind || !(body.kind in UPLOAD_FOLDERS)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  return NextResponse.json(signUpload(body.kind as UploadKind));
}
