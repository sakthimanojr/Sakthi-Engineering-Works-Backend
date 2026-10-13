"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader, { type UploadedImage } from "@/components/ImageUploader";
import { addServiceImages, deleteServiceImage, setCoverImage, updateServiceImage } from "@/app/admin/(dashboard)/actions";
import {
  serviceSlugs,
  serviceTitles,
  serviceDescriptions,
  parseCoverAlt,
  type ServiceSlug,
} from "@/data/catalog";

export type ServiceImageRow = {
  id: string;
  serviceSlug: string;
  url: string;
  alt: string;
  isCover: boolean;
};

export default function CoverManager({ images }: { images: ServiceImageRow[] }) {
  const router = useRouter();

  // Upload state
  const [service, setService] = useState<ServiceSlug>(serviceSlugs[0]);
  const [title, setTitle] = useState(serviceTitles[serviceSlugs[0]] ?? "");
  const [description, setDescription] = useState(serviceDescriptions[serviceSlugs[0]] ?? "");
  const [alt, setAlt] = useState(`${serviceTitles[serviceSlugs[0]]} – Sakthi Engineering Works`);
  const [message, setMessage] = useState<string | null>(null);

  // Edit modal state
  const [editingImage, setEditingImage] = useState<ServiceImageRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editService, setEditService] = useState<ServiceSlug>(serviceSlugs[0]);
  const [editIsCover, setEditIsCover] = useState(false);
  const [editNewImage, setEditNewImage] = useState<UploadedImage | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  function handleServiceChange(newSlug: ServiceSlug) {
    setService(newSlug);
    setTitle(serviceTitles[newSlug] ?? "");
    setDescription(serviceDescriptions[newSlug] ?? "");
    setAlt(`${serviceTitles[newSlug]} – Sakthi Engineering Works`);
  }

  async function onUploaded(list: UploadedImage[]) {
    setMessage("Saving cover photos and content…");
    const res = await addServiceImages({
      serviceSlug: service,
      title: title.trim(),
      description: description.trim(),
      alt: alt.trim(),
      images: list,
    });
    setMessage(res.ok ? `Successfully added ${list.length} photo(s) with cover content.` : res.error ?? "Could not save photos.");
    if (res.ok) {
      router.refresh();
    }
  }

  function openEditModal(img: ServiceImageRow) {
    const parsed = parseCoverAlt(img.alt);
    const slug = (serviceSlugs as readonly string[]).includes(img.serviceSlug)
      ? (img.serviceSlug as ServiceSlug)
      : serviceSlugs[0];

    setEditingImage(img);
    setEditService(slug);
    setEditTitle(parsed.title || serviceTitles[slug] || "");
    setEditDescription(parsed.description || serviceDescriptions[slug] || "");
    setEditAlt(parsed.alt || `${serviceTitles[slug]} – Sakthi Engineering Works`);
    setEditIsCover(img.isCover);
    setEditNewImage(null);
    setEditMessage(null);
  }

  function closeEditModal() {
    setEditingImage(null);
    setEditNewImage(null);
    setEditMessage(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingImage) return;

    setEditSaving(true);
    setEditMessage(null);

    const res = await updateServiceImage({
      id: editingImage.id,
      serviceSlug: editService,
      title: editTitle.trim(),
      description: editDescription.trim(),
      alt: editAlt.trim(),
      url: editNewImage?.url,
      publicId: editNewImage?.publicId,
      isCover: editIsCover,
    });

    setEditSaving(false);
    if (res.ok) {
      closeEditModal();
      router.refresh();
    } else {
      setEditMessage(res.error ?? "Failed to update cover.");
    }
  }

  // Group images by service
  const grouped = new Map<string, ServiceImageRow[]>();
  for (const img of images) {
    const arr = grouped.get(img.serviceSlug) ?? [];
    arr.push(img);
    grouped.set(img.serviceSlug, arr);
  }

  return (
    <div className="space-y-10">
      {/* Upload Section */}
      <div className="card space-y-6 border-l-4 border-l-accent">
        <div>
          <h2 className="text-xl font-bold text-ink">Upload Service Cover Photo & Customize Content</h2>
          <p className="mt-1 text-sm text-steel">
            Select a service, edit the cover headline and description text, and upload your photo. The text is saved with the cover photo and displayed across the website.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Service Selection */}
          <div className="md:col-span-2">
            <label className="label" htmlFor="cv-service">
              Service to upload photos for
            </label>
            <select
              id="cv-service"
              value={service}
              onChange={(e) => handleServiceChange(e.target.value as ServiceSlug)}
              className="input text-base font-medium"
            >
              {serviceSlugs.map((s) => (
                <option key={s} value={s}>
                  {serviceTitles[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Title */}
          <div>
            <label className="label" htmlFor="cv-title">
              Cover Title / Headline
            </label>
            <input
              id="cv-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gates, Grills & Collapsible Gates"
              className="input"
            />
            <p className="mt-1 text-xs text-steel">Shown as the main heading in hero banners and cards.</p>
          </div>

          {/* Alt text */}
          <div>
            <label className="label" htmlFor="cv-alt">
              SEO Alt Text (Image description)
            </label>
            <input
              id="cv-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. Heavy duty sliding gates fabrication at Walajapet"
              className="input"
            />
            <p className="mt-1 text-xs text-steel">Used by search engines and screen readers.</p>
          </div>

          {/* Cover Content / Description */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="label" htmlFor="cv-desc">
                Cover Content / Summary Description
              </label>
              <button
                type="button"
                onClick={() => setDescription(serviceDescriptions[service] ?? "")}
                className="text-xs text-accent-deep hover:underline"
              >
                Reset to default description
              </button>
            </div>
            <textarea
              id="cv-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the service highlights, capabilities, materials or applications..."
              className="input"
            />
            <p className="mt-1 text-xs text-steel">
              Displayed on service cards and as the introductory paragraph on the service detail page.
            </p>
          </div>

          {/* Image Uploader */}
          <div className="md:col-span-2 border-t border-steel/15 pt-5">
            <ImageUploader
              kind="covers"
              onUploaded={onUploaded}
              label={`Upload Photo(s) for ${serviceTitles[service]}`}
            />
          </div>

          {message && (
            <p role="status" className="md:col-span-2 rounded-sm bg-accent/10 p-3 text-sm font-semibold text-ink">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Existing Images Grouped by Service */}
      {grouped.size === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-base text-ink font-semibold">No service cover photos uploaded yet.</p>
          <p className="mt-1 text-sm text-steel">Upload photos above and customize the cover content for each service.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([slug, imgs]) => {
            const currentTitle = serviceTitles[slug as ServiceSlug] ?? slug;
            const currentDesc = serviceDescriptions[slug as ServiceSlug] ?? "";

            return (
              <div key={slug} className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-steel/20 pb-2">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                    <span className="h-1 w-6 bg-accent" />
                    {currentTitle}
                    <span className="ml-2 text-sm font-normal text-steel">
                      ({imgs.length} photo{imgs.length !== 1 ? "s" : ""})
                    </span>
                  </h2>
                  <span className="text-xs text-steel">
                    Active cover: {imgs.find((i) => i.isCover) ? "✓ Set" : "None selected (first will be used)"}
                  </span>
                </div>

                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {imgs.map((img) => {
                    const parsed = parseCoverAlt(img.alt);
                    const displayTitle = parsed.title || currentTitle;
                    const displayDesc = parsed.description || currentDesc;

                    return (
                      <li
                        key={img.id}
                        className={`card flex flex-col justify-between overflow-hidden p-0 transition-shadow hover:shadow-md ${
                          img.isCover ? "ring-2 ring-accent ring-offset-2" : ""
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[16/10] w-full bg-ink">
                          <Image
                            src={img.url}
                            alt={parsed.alt || displayTitle}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          {img.isCover && (
                            <span className="absolute left-2 top-2 bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-ink shadow-sm">
                              ★ Active Cover
                            </span>
                          )}
                        </div>

                        {/* Content preview */}
                        <div className="flex-1 p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-ink text-base line-clamp-1">{displayTitle}</h3>
                            {parsed.title && (
                              <span className="shrink-0 rounded bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-steel uppercase">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-steel line-clamp-2 leading-relaxed">
                            {displayDesc}
                          </p>
                          {parsed.alt && (
                            <p className="text-[11px] text-steel/80 italic truncate border-t border-steel/10 pt-1.5">
                              Alt: {parsed.alt}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 border-t border-steel/15 bg-mist/50 p-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(img)}
                            className="btn text-xs min-h-0 py-1.5 px-3"
                          >
                            Edit Content
                          </button>

                          {!img.isCover && (
                            <form action={setCoverImage}>
                              <input type="hidden" name="id" value={img.id} />
                              <button
                                type="submit"
                                className="btn-dark text-xs min-h-0 py-1.5 px-3"
                              >
                                Set as Cover
                              </button>
                            </form>
                          )}

                          <form action={deleteServiceImage} className="ml-auto">
                            <input type="hidden" name="id" value={img.id} />
                            <button
                              type="submit"
                              onClick={(e) => {
                                if (!confirm("Delete this service photo?")) e.preventDefault();
                              }}
                              className="btn-danger text-xs min-h-0 py-1.5 px-3"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-steel/15 pb-3">
              <h3 className="text-lg font-bold text-ink">Edit Cover Photo & Content</h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-steel hover:text-ink text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveEdit} className="mt-4 space-y-4">
              {/* Preview Current or Replaced Image */}
              <div>
                <label className="label">Cover Photo</label>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded border border-steel/20 bg-ink">
                  <Image
                    src={editNewImage?.url || editingImage.url}
                    alt={editAlt || editTitle}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {editNewImage && (
                    <span className="absolute right-2 top-2 bg-green-600 px-2 py-0.5 text-xs font-bold text-white uppercase">
                      New image selected
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <ImageUploader
                    kind="covers"
                    onUploaded={(list) => {
                      if (list.length > 0) setEditNewImage(list[0]);
                    }}
                    label="Replace photo with a new one (optional)"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="label" htmlFor="edit-service">
                  Assigned Service
                </label>
                <select
                  id="edit-service"
                  value={editService}
                  onChange={(e) => setEditService(e.target.value as ServiceSlug)}
                  className="input"
                >
                  {serviceSlugs.map((s) => (
                    <option key={s} value={s}>
                      {serviceTitles[s]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Title */}
              <div>
                <label className="label" htmlFor="edit-title">
                  Cover Title / Headline
                </label>
                <input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Gates, Grills & Collapsible Gates"
                  className="input"
                />
              </div>

              {/* Cover Description */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="edit-desc">
                    Cover Content / Summary Description
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditDescription(serviceDescriptions[editService] ?? "")}
                    className="text-xs text-accent-deep hover:underline"
                  >
                    Reset to default
                  </button>
                </div>
                <textarea
                  id="edit-desc"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="input"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="label" htmlFor="edit-alt">
                  SEO Alt Text
                </label>
                <input
                  id="edit-alt"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="input"
                />
              </div>

              {/* Active Cover Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="edit-is-cover"
                  type="checkbox"
                  checked={editIsCover}
                  onChange={(e) => setEditIsCover(e.target.checked)}
                  className="h-4 w-4 rounded border-steel/30 text-accent focus:ring-accent"
                />
                <label htmlFor="edit-is-cover" className="text-sm font-semibold text-ink cursor-pointer">
                  Set this photo as the active Cover for {serviceTitles[editService]}
                </label>
              </div>

              {editMessage && (
                <p role="alert" className="text-sm font-semibold text-red-700">
                  {editMessage}
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-steel/15 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editSaving}
                  className="btn-dark text-xs min-h-0 py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="btn text-xs min-h-0 py-2 px-4"
                >
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
