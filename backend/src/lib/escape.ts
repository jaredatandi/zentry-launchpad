/** Escape text before it is interpolated into any HTML response. */
export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Keep only characters that are safe in a tel: href (display text is escaped separately). */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^0-9+]/g, "");
  return digits.startsWith("+") ? `tel:${digits}` : `tel:+${digits}`;
}
