import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { updateEnquiryStatus } from "../../actions";
import { cloudinaryConfigured, signedAttachmentUrl } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "CLOSED"];

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const e = await prisma.enquiry.findUnique({ where: { id } });
  if (!e) notFound();
  const rows: [string, string | null][] = [
    ["Name", e.name], ["Company", e.company], ["Mobile", e.mobile], ["WhatsApp", e.whatsapp], ["Email", e.email], ["Project location", e.location], ["Service", e.service],
    ["Message / description", e.message], ["Approximate dimensions", e.dimensions], ["Material requirement", e.material], ["Quantity", e.quantity], ["Additional requirements", e.additional],
    ["Language", e.language === "ta" ? "Tamil" : "English"], ["Received", e.createdAt.toLocaleString("en-IN")],
  ];
  const attachment = e.attachmentKey && e.attachmentType && cloudinaryConfigured() ? signedAttachmentUrl(e.attachmentKey, e.attachmentType, e.attachmentName) : null;
  const wa = (e.whatsapp || e.mobile).replace(/\D/g, "");
  const waNumber = wa.length === 10 ? `91${wa}` : wa;

  return (
    <div className="space-y-6">
      <Link href="/admin/enquiries" className="text-sm font-semibold underline">← All enquiries</Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-ink">{e.name}</h1>
        <StatusBadge status={e.status} />
      </div>
      <form action={updateEnquiryStatus} className="card flex flex-wrap items-end gap-3">
        <input type="hidden" name="id" value={e.id} />
        <div><label htmlFor="status" className="label">Status</label><select id="status" name="status" defaultValue={e.status} className="input">{STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
        <button type="submit" className="btn">Update status</button>
      </form>
      <dl className="card divide-y divide-steel/15">
        {rows.filter(([, v]) => v).map(([k, v]) => (<div key={k} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr]"><dt className="text-sm font-semibold uppercase tracking-wide">{k}</dt><dd className="whitespace-pre-wrap break-words text-ink">{v}</dd></div>))}
        {attachment && (<div className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr]"><dt className="text-sm font-semibold uppercase tracking-wide">Attachment</dt><dd><a href={attachment} target="_blank" rel="noopener noreferrer" className="font-bold text-accent-deep underline">{e.attachmentName ?? "Open file"}</a></dd></div>)}
      </dl>
      <div className="flex flex-wrap gap-3">
        <a href={`tel:${e.mobile}`} className="btn-dark">Call</a>
        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn-dark">WhatsApp</a>
        {e.email && <a href={`mailto:${e.email}`} className="btn-dark">Email</a>}
      </div>
    </div>
  );
}
