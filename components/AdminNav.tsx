import Link from "next/link";
import { signOut } from "@/auth";

const links = [
  { href: "/admin", label: "Dashboard" }, { href: "/admin/enquiries", label: "Enquiries" }, { href: "/admin/messages", label: "Messages" },
  { href: "/admin/projects", label: "Projects" }, { href: "/admin/gallery", label: "Gallery" }, { href: "/admin/covers", label: "Covers" },
];

export default function AdminNav({ email }: { email: string }) {
  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <span className="font-bold uppercase tracking-wide">Sakthi <span className="text-accent">Admin</span></span>
        <nav aria-label="Admin" className="flex flex-wrap gap-1">
          {links.map((l) => (<Link key={l.href} href={l.href} className="px-3 py-2 text-sm font-semibold hover:text-accent">{l.label}</Link>))}
        </nav>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }} className="flex items-center gap-3">
          <span className="hidden text-sm text-white/70 sm:inline">{email}</span>
          <button type="submit" className="border border-white/40 px-3 py-1.5 text-sm font-semibold hover:bg-white hover:text-ink">Sign out</button>
        </form>
      </div>
    </header>
  );
}
