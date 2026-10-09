import Link from "next/link";
import { deleteProject } from "../actions";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { serviceTitles, type ServiceSlug } from "@/data/catalog";

export default async function ProjectsPage() {
  await requireAdmin();
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { images: true } } } });
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-ink">Projects</h1>
        <Link href="/admin/projects/new" className="btn">Add project</Link>
      </div>
      {projects.length === 0 ? (
        <p className="card text-center">No projects yet. The website shows &quot;project information coming soon&quot; until you add and publish one.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-ink">{p.title}</p>
                <p className="text-sm">{serviceTitles[p.category as ServiceSlug] ?? p.category} · {p._count.images} photo(s) · {p.published ? "Published" : "Draft"}{p.featured ? " · Featured" : ""}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/projects/${p.id}`} className="btn-dark">Edit</Link>
                <form action={deleteProject}><input type="hidden" name="id" value={p.id} /><button type="submit" className="btn-danger">Delete</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
