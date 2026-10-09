import AdminNav from "@/components/AdminNav";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();
  return (
    <>
      <AdminNav email={email} />
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </>
  );
}
