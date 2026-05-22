import type { CloudinaryResourceType } from "./config";

const FORMAT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
};

/** Payload 会从 filename 扩展名推断 MIME；禁止使用 Cloudinary public_id 路径作为 filename。 */
export function buildPayloadFilename(
  originalName: string,
  format: string,
): string {
  const ext = format.replace(/^\./, "").toLowerCase() || "bin";
  const base =
    originalName.replace(/\.[^./\\]+$/, "").trim() ||
    "upload";
  const safeBase = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return `${safeBase}.${ext}`;
}

/** 从文件名扩展名推断 MIME（用于修正浏览器误报的 text/plain 等）。 */
export function mimeFromFilename(
  filename: string,
  resourceType: CloudinaryResourceType,
): string {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  const ext = match?.[1] ?? "";
  return (
    mimeFromFormat(ext, resourceType) ??
    (resourceType === "video" ? "video/mp4" : "image/jpeg")
  );
}

export function mimeFromFormat(
  format: string,
  resourceType: CloudinaryResourceType,
): string | undefined {
  const key = format.replace(/^\./, "").toLowerCase();
  const mapped = FORMAT_TO_MIME[key];
  if (mapped) return mapped;
  if (resourceType === "video") return "video/mp4";
  if (resourceType === "image") return "image/jpeg";
  return undefined;
}

/**
 * 优先使用浏览器 File.type；无效时根据 Cloudinary format / resource_type 推断。
 */
export function resolveMimeType(options: {
  fileType: string;
  format: string;
  resourceType: CloudinaryResourceType;
}): string {
  const { fileType, format, resourceType } = options;
  const normalized = fileType.trim().toLowerCase();

  if (
    normalized &&
    normalized !== "application/octet-stream" &&
    !normalized.startsWith("text/") &&
    (normalized.startsWith("image/") || normalized.startsWith("video/"))
  ) {
    return fileType;
  }

  const fromFormat = mimeFromFormat(format, resourceType);
  if (fromFormat) return fromFormat;

  return resourceType === "video" ? "video/mp4" : "image/jpeg";
}
