/**
 * 将英文标题转为 URL 友好的 slug（小写、连字符）。
 */
export function slugifyEnglishTitle(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
