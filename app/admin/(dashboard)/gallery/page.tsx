import GalleryManager from "@/components/GalleryManager";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function GalleryPage() {
  await requireAdmin();
  const images = await prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-ink">Gallery</h1>
      <GalleryManager images={images.map((i) => ({ id: i.id, url: i.url, category: i.category, alt: i.alt }))} />
    </div>
  );
}
