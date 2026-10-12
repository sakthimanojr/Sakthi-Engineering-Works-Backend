"use client";

import { useState } from "react";

export type UploadedImage = { url: string; publicId: string };

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 10 * 1024 * 1024;

/** Uploads straight from the browser to Cloudinary using a short-lived signature from our server. */
export default function ImageUploader({ kind, onUploaded, label = "Upload photos" }: { kind: "projects" | "gallery" | "covers"; onUploaded: (images: UploadedImage[]) => void | Promise<void>; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setError(null);
    const done: UploadedImage[] = [];
    try {
      for (const f of files) {
        if (!TYPES.includes(f.type)) throw new Error(`${f.name}: only JPG, PNG or WEBP photos are allowed.`);
        if (f.size > MAX) throw new Error(`${f.name}: larger than 10 MB.`);
        const sigRes = await fetch("/api/admin/upload-signature", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
        if (!sigRes.ok) throw new Error("Could not start the upload. Check Cloudinary settings or sign in again.");
        const sig = (await sigRes.json()) as { cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string };
        const fd = new FormData();
        fd.append("file", f);
        fd.append("api_key", sig.apiKey);
        fd.append("timestamp", String(sig.timestamp));
        fd.append("folder", sig.folder);
        fd.append("signature", sig.signature);
        const up = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body: fd });
        if (!up.ok) throw new Error(`${f.name}: upload failed.`);
        const j = (await up.json()) as { secure_url: string; public_id: string };
        done.push({ url: j.secure_url, publicId: j.public_id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      if (done.length) await onUploaded(done);
      setBusy(false);
      input.value = "";
    }
  }

  return (
    <div>
      <label className="label" htmlFor={`up-${kind}`}>{label}</label>
      <input id={`up-${kind}`} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={onChange} className="input file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white" />
      <p className="mt-1 text-sm">JPG, PNG or WEBP, up to 10 MB each.</p>
      {busy && <p role="status" className="mt-2 text-sm font-semibold text-ink">Uploading…</p>}
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}
