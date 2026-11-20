export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "page"
  );
}

/** Returns a unique slug, appending -2, -3 ... when needed. */
export function uniqueSlug(base: string, exists: (candidate: string) => boolean): string {
  const root = slugify(base);
  let candidate = root;
  let n = 2;
  while (exists(candidate)) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}
