import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { cloudinaryConfigured, uploadAttachment } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { emailConfigured, sendNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { checkUpload } from "@/lib/upload";
import { schemas, type EnquiryKind } from "@/lib/validation";
import { serviceTitles, type ServiceSlug } from "@/data/catalog";

export const runtime = "nodejs";
const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status });

function keyOk(given: string | null): boolean {
  const expected = process.env.FRONTEND_API_KEY ?? "";
  if (!expected || !given) return false;
  const a = Buffer.from(expected), b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Server-to-server only: called by the frontend with the shared secret. Validates again; nothing from the client is trusted. */
export async function POST(req: NextRequest) {
  if (!keyOk(req.headers.get("x-api-key"))) return json({ ok: false, error: "unauthorized" }, 401);
  const ip = req.headers.get("x-client-ip") ?? "unknown";
  if (!rateLimit(`enq:${ip}`, 20, 10 * 60 * 1000)) return json({ ok: false, error: "rate_limited" }, 429);

  let form: FormData;
  try { form = await req.formData(); } catch { return json({ ok: false, error: "bad_request" }, 400); }
  const kind = String(form.get("kind") ?? "") as EnquiryKind;
  if (!(kind in schemas)) return json({ ok: false, error: "bad_request" }, 400);

  const raw: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string" && k !== "kind") raw[k] = sanitizeText(v);

  const parsed = schemas[kind].safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] = issue.message;
    return json({ ok: false, error: "validation", fields }, 422);
  }
  const d = parsed.data as Record<string, string>;
  const language = raw.language === "ta" ? "ta" : "en";
  const serviceTitle = d.service === "other" ? "Other / Not sure" : d.service ? serviceTitles[d.service as ServiceSlug] ?? "" : "";

  let attachmentKey: string | null = null, attachmentType: string | null = null, attachmentName: string | null = null;
  const file = form.get("file");
  if (kind === "project" && file instanceof File && file.size > 0) {
    const check = await checkUpload(file);
    if (!check.ok) return json({ ok: false, error: "validation", fields: { file: check.error } }, 422);
    if (cloudinaryConfigured()) {
      try {
        const up = await uploadAttachment(check.buffer);
        attachmentKey = up.public_id; attachmentType = up.resource_type; attachmentName = sanitizeText(file.name, 120);
      } catch (e) {
        console.error("Attachment upload failed", e instanceof Error ? e.message : e);
      }
    } else {
      console.warn("Cloudinary not configured: attachment skipped");
    }
  }

  let saved = false, emailed = false;
  try {
    if (kind === "contact") {
      await prisma.contactSubmission.create({ data: { name: d.name, mobile: d.mobile, email: d.email || null, message: d.message } });
    } else {
      await prisma.enquiry.create({
        data: {
          type: kind === "project" ? "PROJECT" : "QUICK", name: d.name, company: d.company || null, mobile: d.mobile, whatsapp: d.whatsapp || null,
          email: d.email || null, location: d.location || null, service: serviceTitle || null, message: d.message ?? d.description ?? "",
          dimensions: d.dimensions || null, material: d.material || null, quantity: d.quantity || null, additional: d.additional || null,
          attachmentKey, attachmentType, attachmentName, language,
        },
      });
    }
    saved = true;
  } catch (e) {
    console.error("Database write failed", e instanceof Error ? e.message : e);
  }

  if (emailConfigured()) {
    try {
      const lines = Object.entries(d).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
      if (serviceTitle) lines.push(`service (name): ${serviceTitle}`);
      if (attachmentName) lines.push(`attachment: ${attachmentName} (open it from the admin panel)`);
      emailed = await sendNotification(`New ${kind} enquiry – ${d.name}`, lines.join("\n"), d.email || undefined);
    } catch (e) {
      console.error("Email failed", e instanceof Error ? e.message : e);
    }
  }

  if (!saved && !emailed) return json({ ok: false, error: "server" }, 503);
  return json({ ok: true });
}
