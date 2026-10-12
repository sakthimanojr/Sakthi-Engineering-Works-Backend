import CoverManager from "@/components/CoverManager";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function CoversPage() {
  await requireAdmin();
  const images = await prisma.serviceImage.findMany({
    orderBy: [{ serviceSlug: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink">Service Cover Photos</h1>
        <p className="mt-1 text-steel">
          Upload photos for each service. Click <strong>&quot;Set as Cover&quot;</strong> on any photo to make it the cover image
          displayed on the website for that service card and service page.
          The first photo you upload for a service is automatically set as cover.
        </p>
      </div>
      <CoverManager images={images.map((i) => ({ id: i.id, serviceSlug: i.serviceSlug, url: i.url, alt: i.alt, isCover: i.isCover }))} />
    </div>
  );
}
