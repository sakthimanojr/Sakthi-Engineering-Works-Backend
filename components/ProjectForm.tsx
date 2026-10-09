"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import ImageUploader, { type UploadedImage } from "@/components/ImageUploader";
import { saveProject, type FormState } from "@/app/admin/(dashboard)/actions";
import { serviceSlugs, serviceTitles } from "@/data/catalog";

export type ProjectFormValues = {
  id?: string; title: string; slug: string; category: string; location: string; description: string; date: string;
  featured: boolean; published: boolean; images: { url: string; publicId: string; alt: string }[];
};

export default function ProjectForm({ initial }: { initial: ProjectFormValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProject, { error: null });
  const [images, setImages] = useState(initial.images);

  const add = (list: UploadedImage[]) => setImages((prev) => [...prev, ...list.map((i) => ({ ...i, alt: "" }))]);
  const remove = (publicId: string) => setImages((prev) => prev.filter((i) => i.publicId !== publicId));
  const setAlt = (publicId: string, alt: string) => setImages((prev) => prev.map((i) => (i.publicId === publicId ? { ...i, alt } : i)));
  const move = (idx: number, d: number) => setImages((prev) => { const n = [...prev]; const j = idx + d; if (j < 0 || j >= n.length) return prev; [n[idx], n[j]] = [n[j], n[idx]]; return n; });

  return (
    <form action={action} className="card space-y-5">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label" htmlFor="title">Project title</label><input id="title" name="title" required defaultValue={initial.title} className="input" /></div>
        <div><label className="label" htmlFor="slug">URL name (optional)</label><input id="slug" name="slug" defaultValue={initial.slug} placeholder="made from the title if empty" className="input" /></div>
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={initial.category} className="input">
            {serviceSlugs.map((s) => (<option key={s} value={s}>{serviceTitles[s]}</option>))}
          </select>
        </div>
        <div><label className="label" htmlFor="location">Location</label><input id="location" name="location" defaultValue={initial.location} className="input" /></div>
        <div><label className="label" htmlFor="date">Completion date (optional)</label><input id="date" name="date" type="date" defaultValue={initial.date} className="input" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" required rows={6} defaultValue={initial.description} className="input" /></div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 font-semibold text-ink"><input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-5 w-5" /> Featured (shown first)</label>
        <label className="flex items-center gap-2 font-semibold text-ink"><input type="checkbox" name="published" defaultChecked={initial.published} className="h-5 w-5" /> Published on website</label>
      </div>

      <div className="space-y-4 border-t border-steel/15 pt-5">
        <h2 className="text-xl font-bold text-ink">Photos</h2>
        <ImageUploader kind="projects" onUploaded={add} />
        {images.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {images.map((img, idx) => (
              <li key={img.publicId} className="border border-steel/20 p-3">
                <Image src={img.url} alt={img.alt || "Uploaded project photo"} width={400} height={260} unoptimized className="h-40 w-full object-cover" />
                <label className="label mt-3" htmlFor={`alt-${idx}`}>Photo description (alt text)</label>
                <input id={`alt-${idx}`} value={img.alt} onChange={(e) => setAlt(img.publicId, e.target.value)} placeholder="Describe what the photo shows" className="input" />
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => move(idx, -1)} className="btn-dark" aria-label="Move earlier">←</button>
                  <button type="button" onClick={() => move(idx, 1)} className="btn-dark" aria-label="Move later">→</button>
                  <button type="button" onClick={() => remove(img.publicId)} className="btn-danger">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm">The first photo is the cover. Removed photos are deleted from Cloudinary when you save.</p>
      </div>

      {state.error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-800">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn">{pending ? "Saving…" : "Save project"}</button>
    </form>
  );
}
