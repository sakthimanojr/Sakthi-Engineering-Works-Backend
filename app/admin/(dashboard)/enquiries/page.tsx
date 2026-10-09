import Link from "next/link";
import type { EnquiryStatus, Prisma } from "@prisma/client";
import StatusBadge from "@/components/StatusBadge";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "QUOTED", "CLOSED"];
const PAGE = 25;

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as EnquiryStatus) ? (sp.status as EnquiryStatus) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.EnquiryWhereInput = status ? { status } : {};
  const [rows, total] = await Promise.all([
    prisma.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    prisma.enquiry.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const q = (p: number) => `/admin/enquiries?${new URLSearchParams({ ...(status ? { status } : {}), page: String(p) })}`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Enquiries</h1>
      <nav aria-label="Filter by status" className="my-5 flex flex-wrap gap-2">
        <Link href="/admin/enquiries" className={`btn-dark ${!status ? "!bg-accent !text-ink" : ""}`}>All</Link>
        {STATUSES.map((s) => (<Link key={s} href={`/admin/enquiries?status=${s}`} className={`btn-dark ${status === s ? "!bg-accent !text-ink" : ""}`}>{s}</Link>))}
      </nav>
      {rows.length === 0 ? (
        <p className="card text-center">No enquiries found.</p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-ink text-white"><tr><th className="p-3">Date</th><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Service</th><th className="p-3">Mobile</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-steel/15 hover:bg-mist/60">
                  <td className="p-3 whitespace-nowrap">{r.createdAt.toLocaleDateString("en-IN")}</td>
                  <td className="p-3"><Link href={`/admin/enquiries/${r.id}`} className="font-bold text-ink underline">{r.name}</Link></td>
                  <td className="p-3">{r.type === "PROJECT" ? "Project" : "Quick"}</td>
                  <td className="p-3">{r.service ?? "—"}</td>
                  <td className="p-3">{r.mobile}</td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="mt-5 flex items-center gap-3">
          {page > 1 && <Link href={q(page - 1)} className="btn-dark">Previous</Link>}
          <span className="text-sm">Page {page} of {pages}</span>
          {page < pages && <Link href={q(page + 1)} className="btn-dark">Next</Link>}
        </div>
      )}
    </div>
  );
}
