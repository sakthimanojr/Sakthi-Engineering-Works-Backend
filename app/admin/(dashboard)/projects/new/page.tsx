import ProjectForm from "@/components/ProjectForm";
import { requireAdmin } from "@/lib/session";

export default async function NewProject() {
  await requireAdmin();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-ink">Add project</h1>
      <ProjectForm initial={{ title: "", slug: "", category: "structural-sheds-roofing", location: "", description: "", date: "", featured: false, published: true, images: [] }} />
    </div>
  );
}
