"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData): Promise<void> {
  try {
    await signIn("credentials", { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? ""), redirectTo: "/admin" });
  } catch (e) {
    if (e instanceof AuthError) redirect("/admin/login?error=1");
    throw e; // lets Next.js handle the success redirect
  }
}
