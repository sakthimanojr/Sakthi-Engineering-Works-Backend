import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function MessagesPage() {
  await requireAdmin();
  const rows = await prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-ink">Contact messages</h1>
      {rows.length === 0 ? <p className="card text-center">No messages yet.</p> : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={m.id} className="card">
              <p className="font-bold text-ink">{m.name} · <a href={`tel:${m.mobile}`} className="underline">{m.mobile}</a>{m.email && <> · <a href={`mailto:${m.email}`} className="underline">{m.email}</a></>}</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-ink">{m.message}</p>
              <p className="mt-2 text-sm">{m.createdAt.toLocaleString("en-IN")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
