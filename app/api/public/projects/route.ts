import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public, read-only. Returns published projects only. */
export async function GET() {
  try {
    const rows = await prisma.project.findMany({
      where: { published: true },
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({
      projects: rows.map((p) => ({
        title: p.title, slug: p.slug, category: p.category, location: p.location, description: p.description,
        date: p.date ? p.date.toISOString() : null, featured: p.featured, images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
      })),
    }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 503 });
  }
}
