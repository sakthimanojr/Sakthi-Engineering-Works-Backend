/** Tell the public site to refresh its cached projects/gallery. Best effort: it also refreshes itself every 60 seconds. */
export async function notifyFrontend(): Promise<void> {
  const url = process.env.FRONTEND_URL?.replace(/\/+$/, "");
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(`${url}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": secret }, signal: AbortSignal.timeout(5000) });
  } catch {
    /* ignore */
  }
}
