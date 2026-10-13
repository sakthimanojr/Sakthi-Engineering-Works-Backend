import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseCoverAlt } from "@/data/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Return only the cover image per service (isCover = true)
    const rows = await prisma.serviceImage.findMany({
      where: { isCover: true },
      orderBy: { serviceSlug: "asc" },
    });
    return NextResponse.json(
      {
        covers: rows.map((r) => {
          const meta = parseCoverAlt(r.alt);
          return {
            slug: r.serviceSlug,
            url: r.url,
            alt: meta.alt || r.alt,
            title: meta.title || undefined,
            description: meta.description || undefined,
          };
        }),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json({ error: "server" }, { status: 503 });
  }
}
