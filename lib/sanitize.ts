/** Strip control characters and HTML tags; collapse excess whitespace. Output is stored as plain text. */
export function sanitizeText(input: unknown, max = 3000): string {
  if (typeof input !== "string") return "";
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, max);
}
