"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader, { type UploadedImage } from "@/components/ImageUploader";
import { addGalleryImages, deleteGalleryImage } from "@/app/admin/(dashboard)/actions";
import { galleryCategories, galleryLabels, type GalleryCategory } from "@/data/catalog";

export type GalleryRow = { id: string; url: string; category: string; alt: string };

export default function GalleryManager({ images }: { images: GalleryRow[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<GalleryCategory>("factory");
  const [alt, setAlt] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function onUploaded(list: UploadedImage[]) {
    const res = await addGalleryImages({ category, alt, images: list });
    setMessage(res.ok ? `${list.length} photo(s) added.` : res.error ?? "Could not save photos.");
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="card grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="g-cat">Category for the photos you upload next</label>
          <select id="g-cat" value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)} className="input">
            {galleryCategories.map((c) => (<option key={c} value={c}>{galleryLabels[c]}</option>))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="g-alt">Photo description (optional, used as alt text)</label>
          <input id="g-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe what the photos show" className="input" />
        </div>
        <div className="sm:col-span-2"><ImageUploader kind="gallery" onUploaded={onUploaded} label="Upload gallery photos" /></div>
        {message && <p role="status" className="sm:col-span-2 text-sm font-semibold text-ink">{message}</p>}
      </div>

      {images.length === 0 ? (
        <p className="card text-center">No gallery photos yet. The website shows its placeholder photos until you add some.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((i) => (
            <li key={i.id} className="card p-3">
              <Image src={i.url} alt={i.alt} width={400} height={260} unoptimized className="h-44 w-full object-cover" />
              <p className="mt-2 text-sm font-semibold text-ink">{galleryLabels[i.category as GalleryCategory] ?? i.category}</p>
              <p className="truncate text-sm">{i.alt}</p>
              <form action={deleteGalleryImage} className="mt-3">
                <input type="hidden" name="id" value={i.id} />
                <button type="submit" className="btn-danger">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
