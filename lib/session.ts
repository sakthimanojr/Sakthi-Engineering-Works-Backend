import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Call at the top of every admin page and server action.
 * Also checks the account still exists, so deleting an AdminUser row revokes access immediately.
 */
export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/admin/login");
  const exists = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
  if (!exists) redirect("/admin/login");
  return { email };
}
