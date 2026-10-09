import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function Dashboard() {
  await requireAdmin();
  const [newCount, total, messages, projects, gallery] = await Promise.all([
    prisma.enquiry.count({ where: { status: "NEW" } }), prisma.enquiry.count(), prisma.contactSubmission.count(),
    prisma.project.count(), prisma.galleryImage.count(),
  ]);
  const cards = [
    { label: "New enquiries", value: newCount, href: "/admin/enquiries?status=NEW" }, { label: "All enquiries", value: total, href: "/admin/enquiries" },
    { label: "Contact messages", value: messages, href: "/admin/messages" }, { label: "Projects", value: projects, href: "/admin/projects" }, { label: "Gallery photos", value: gallery, href: "/admin/gallery" },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label}><Link href={c.href} className="card block hover:border-accent"><p className="text-sm font-semibold uppercase tracking-wide">{c.label}</p><p className="mt-1 text-4xl font-bold text-ink">{c.value}</p></Link></li>
        ))}
      </ul>
    </div>
  );
}
