import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginAction } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (session?.user) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5">
      <form action={loginAction} className="w-full max-w-sm space-y-5 border-t-4 border-accent bg-white p-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sakthi Engineering Works</h1>
          <p className="text-sm text-steel">Admin sign in</p>
        </div>
        {error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">Sign in failed. Check your email and password, then try again.</p>}
        <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
        <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
        <button type="submit" className="btn w-full">Sign in</button>
      </form>
    </main>
  );
}
