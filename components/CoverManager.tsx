"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader, { type UploadedImage } from "@/components/ImageUploader";
import { addServiceImages, deleteServiceImage, setCoverImage } from "@/app/admin/(dashboard)/actions";
import { serviceSlugs, serviceTitles, type ServiceSlug } from "@/data/catalog";

export type ServiceImageRow = { id: string; serviceSlug: string; url: string; alt: string; isCover: boolean };

export default function CoverManager({ images }: { images: ServiceImageRow[] }) {
  const router = useRouter();
  const [service, setService] = useState<ServiceSlug>(serviceSlugs[0]);
  const [alt, setAlt] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function onUploaded(list: UploadedImage[]) {
    const res = await addServiceImages({ serviceSlug: service, alt, images: list });
    setMessage(res.ok ? `${list.length} photo(s) added.` : res.error ?? "Could not save photos.");
    if (res.ok) router.refresh();
  }

  // Group images by service
  const grouped = new Map<string, ServiceImageRow[]>();
  for (const img of images) {
    const arr = grouped.get(img.serviceSlug) ?? [];
    arr.push(img);
    grouped.set(img.serviceSlug, arr);
  }

  return (
    <div className="space-y-8">
      {/* Upload section */}
      <div className="card grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="cv-service">Service to upload photos for</label>
          <select id="cv-service" value={service} onChange={(e) => setService(e.target.value as ServiceSlug)} className="input">
            {serviceSlugs.map((s) => (<option key={s} value={s}>{serviceTitles[s]}</option>))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="cv-alt">Photo description (optional, used as alt text)</label>
          <input id="cv-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe what the photo shows" className="input" />
        </div>
        <div className="sm:col-span-2"><ImageUploader kind="covers" onUploaded={onUploaded} label="Upload service photos" /></div>
        {message && <p role="status" className="sm:col-span-2 text-sm font-semibold text-ink">{message}</p>}
      </div>

      {/* Images grouped by service */}
      {grouped.size === 0 ? (
        <p className="card text-center">No service cover photos uploaded yet. Upload photos above and select one as the cover for each service.</p>
      ) : (
        Array.from(grouped.entries()).map(([slug, imgs]) => (
          <div key={slug} className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <span className="h-1 w-6 bg-accent" />
              {serviceTitles[slug as ServiceSlug] ?? slug}
              <span className="ml-2 text-sm font-normal text-steel">({imgs.length} photo{imgs.length !== 1 ? "s" : ""})</span>
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imgs.map((img) => (
                <li key={img.id} className={`card p-3 ${img.isCover ? "ring-2 ring-accent ring-offset-2" : ""}`}>
                  <div className="relative">
                    <Image src={img.url} alt={img.alt} width={400} height={260} unoptimized className="h-44 w-full object-cover" />
                    {img.isCover && (
                      <span className="absolute left-2 top-2 bg-accent px-2 py-1 text-xs font-bold uppercase text-ink">
                        ★ Cover
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm">{img.alt}</p>
                  <div className="mt-3 flex gap-2">
                    {!img.isCover && (
                      <form action={setCoverImage}>
                        <input type="hidden" name="id" value={img.id} />
                        <button type="submit" className="btn-primary text-xs">Set as Cover</button>
                      </form>
                    )}
                    <form action={deleteServiceImage}>
                      <input type="hidden" name="id" value={img.id} />
                      <button type="submit" className="btn-danger">Delete</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
