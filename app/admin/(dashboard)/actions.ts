"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, type EnquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { destroyImage, isOurImageUrl, isOurPublicId } from "@/lib/cloudinary";
import { notifyFrontend } from "@/lib/notify-frontend";
import { requireAdmin } from "@/lib/session";
import { galleryCategories, serviceSlugs, serializeCoverAlt } from "@/data/catalog";

const STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "QUOTED", "CLOSED"];

export async function updateEnquiryStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as EnquiryStatus;
  if (!id || !STATUSES.includes(status)) return;
  await prisma.enquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const imageSchema = z.object({
  url: z.string().url().refine(isOurImageUrl, "Image is not from this Cloudinary account."),
  publicId: z.string().min(1).max(300).refine(isOurPublicId, "Invalid image id."),
  alt: z.string().trim().max(200),
});
const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(150),
  slug: z.string().trim().max(100).optional(),
  category: z.enum(serviceSlugs),
  location: z.string().trim().max(150).optional(),
  description: z.string().trim().min(5, "Add a description.").max(5000),
  date: z.string().optional(),
  featured: z.boolean(),
  published: z.boolean(),
  images: z.array(imageSchema).max(20),
});

export type FormState = { error: string | null };

export async function saveProject(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  let images: unknown = [];
  try { images = JSON.parse(String(formData.get("images") ?? "[]")); } catch { return { error: "Images could not be read. Please re-upload." }; }

  const parsed = projectSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined, title: formData.get("title"), slug: String(formData.get("slug") ?? ""), category: formData.get("category"),
    location: String(formData.get("location") ?? ""), description: formData.get("description"), date: String(formData.get("date") ?? ""),
    featured: formData.get("featured") === "on", published: formData.get("published") === "on", images,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const p = parsed.data;
  const slug = slugify(p.slug || p.title);
  if (!slug) return { error: "Could not make a URL name from the title." };
  const date = p.date ? new Date(p.date) : null;
  if (date && Number.isNaN(date.getTime())) return { error: "Invalid date." };
  const imgs = p.images.map((i, idx) => ({ url: i.url, publicId: i.publicId, alt: i.alt || `${p.title} – Sakthi Engineering Works`, sortOrder: idx }));

  try {
    if (p.id) {
      const old = await prisma.projectImage.findMany({ where: { projectId: p.id } });
      await prisma.$transaction([
        prisma.projectImage.deleteMany({ where: { projectId: p.id } }),
        prisma.project.update({
          where: { id: p.id },
          data: { slug, title: p.title, category: p.category, location: p.location || null, description: p.description, date, featured: p.featured, published: p.published, images: { create: imgs } },
        }),
      ]);
      const keep = new Set(imgs.map((i) => i.publicId));
      await Promise.all(old.filter((o) => !keep.has(o.publicId)).map((o) => destroyImage(o.publicId)));
    } else {
      await prisma.project.create({
        data: { slug, title: p.title, category: p.category, location: p.location || null, description: p.description, date, featured: p.featured, published: p.published, images: { create: imgs } },
      });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: "Another project already uses this URL name. Change the title or URL name." };
    console.error("saveProject failed", e instanceof Error ? e.message : e);
    return { error: "Could not save the project. Please try again." };
  }
  await notifyFrontend();
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const images = await prisma.projectImage.findMany({ where: { projectId: id } });
  await prisma.project.delete({ where: { id } }).catch(() => null);
  await Promise.all(images.map((i) => destroyImage(i.publicId)));
  await notifyFrontend();
  revalidatePath("/admin/projects");
}

export async function addGalleryImages(input: { category: string; alt: string; images: { url: string; publicId: string }[] }): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!(galleryCategories as readonly string[]).includes(input.category)) return { ok: false, error: "Choose a category." };
  const alt = input.alt.trim().slice(0, 200);
  const valid = input.images.filter((i) => isOurImageUrl(i.url) && isOurPublicId(i.publicId)).slice(0, 30);
  if (!valid.length) return { ok: false, error: "No valid images." };
  await prisma.galleryImage.createMany({ data: valid.map((i) => ({ category: input.category, url: i.url, publicId: i.publicId, alt: alt || `${input.category.replace(/-/g, " ")} – Sakthi Engineering Works` })) });
  await notifyFrontend();
  revalidatePath("/admin/gallery");
  return { ok: true };
}

export async function deleteGalleryImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const img = await prisma.galleryImage.findUnique({ where: { id } });
  if (!img) return;
  await prisma.galleryImage.delete({ where: { id } });
  await destroyImage(img.publicId);
  await notifyFrontend();
  revalidatePath("/admin/gallery");
}

// ── Service Cover Image Actions ──────────────────────────────────────

export async function addServiceImages(input: {
  serviceSlug: string;
  alt: string;
  title?: string;
  description?: string;
  images: { url: string; publicId: string }[];
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!(serviceSlugs as readonly string[]).includes(input.serviceSlug)) return { ok: false, error: "Choose a service." };
  const valid = input.images.filter((i) => isOurImageUrl(i.url) && isOurPublicId(i.publicId)).slice(0, 30);
  if (!valid.length) return { ok: false, error: "No valid images." };
  const existing = await prisma.serviceImage.count({ where: { serviceSlug: input.serviceSlug } });
  const hasCover = existing > 0;
  const serializedAlt = serializeCoverAlt({
    title: input.title,
    description: input.description,
    alt: input.alt.trim().slice(0, 200) || `${input.serviceSlug.replace(/-/g, " ")} – Sakthi Engineering Works`,
  });
  await prisma.serviceImage.createMany({
    data: valid.map((i, idx) => ({
      serviceSlug: input.serviceSlug,
      url: i.url,
      publicId: i.publicId,
      alt: serializedAlt,
      isCover: !hasCover && idx === 0, // first image of a service auto-becomes cover if none exists
    })),
  });
  await notifyFrontend();
  revalidatePath("/admin/covers");
  return { ok: true };
}

export async function updateServiceImage(input: {
  id: string;
  serviceSlug?: string;
  title?: string;
  description?: string;
  alt: string;
  url?: string;
  publicId?: string;
  isCover?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const id = input.id?.trim();
  if (!id) return { ok: false, error: "Missing image ID." };
  const img = await prisma.serviceImage.findUnique({ where: { id } });
  if (!img) return { ok: false, error: "Image not found." };

  const targetSlug = input.serviceSlug && (serviceSlugs as readonly string[]).includes(input.serviceSlug)
    ? input.serviceSlug
    : img.serviceSlug;

  const serializedAlt = serializeCoverAlt({
    title: input.title,
    description: input.description,
    alt: input.alt?.trim().slice(0, 200) || `${targetSlug.replace(/-/g, " ")} – Sakthi Engineering Works`,
  });

  const updateData: {
    alt: string;
    serviceSlug: string;
    url?: string;
    publicId?: string;
  } = {
    alt: serializedAlt,
    serviceSlug: targetSlug,
  };

  if (input.url && isOurImageUrl(input.url) && input.publicId && isOurPublicId(input.publicId)) {
    const oldPublicId = img.publicId;
    updateData.url = input.url;
    updateData.publicId = input.publicId;
    if (oldPublicId && oldPublicId !== input.publicId) {
      await destroyImage(oldPublicId);
    }
  }

  if (input.isCover) {
    await prisma.$transaction([
      prisma.serviceImage.updateMany({ where: { serviceSlug: targetSlug, isCover: true }, data: { isCover: false } }),
      prisma.serviceImage.update({ where: { id }, data: { ...updateData, isCover: true } }),
    ]);
  } else {
    await prisma.serviceImage.update({
      where: { id },
      data: updateData,
    });
  }

  await notifyFrontend();
  revalidatePath("/admin/covers");
  return { ok: true };
}

export async function deleteServiceImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const img = await prisma.serviceImage.findUnique({ where: { id } });
  if (!img) return;
  await prisma.serviceImage.delete({ where: { id } });
  await destroyImage(img.publicId);
  await notifyFrontend();
  revalidatePath("/admin/covers");
}

export async function setCoverImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const img = await prisma.serviceImage.findUnique({ where: { id } });
  if (!img) return;
  // Clear all covers for this service, then set the selected one
  await prisma.$transaction([
    prisma.serviceImage.updateMany({ where: { serviceSlug: img.serviceSlug, isCover: true }, data: { isCover: false } }),
    prisma.serviceImage.update({ where: { id }, data: { isCover: true } }),
  ]);
  await notifyFrontend();
  revalidatePath("/admin/covers");
}
