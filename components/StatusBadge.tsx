import clsx from "clsx";

const styles: Record<string, string> = {
  NEW: "bg-accent text-ink", CONTACTED: "bg-blue-100 text-blue-900", QUOTED: "bg-purple-100 text-purple-900", CLOSED: "bg-steel/15 text-steel",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={clsx("inline-block rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wide", styles[status] ?? styles.CLOSED)}>{status}</span>;
}
