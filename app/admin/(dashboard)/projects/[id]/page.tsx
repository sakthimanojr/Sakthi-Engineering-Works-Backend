import { notFound } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.project.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  if (!p) notFound();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-ink">Edit project</h1>
      <ProjectForm initial={{
        id: p.id, title: p.title, slug: p.slug, category: p.category, location: p.location ?? "", description: p.description,
        date: p.date ? p.date.toISOString().slice(0, 10) : "", featured: p.featured, published: p.published,
        images: p.images.map((i) => ({ url: i.url, publicId: i.publicId, alt: i.alt })),
      }} />
    </div>
  );
}
