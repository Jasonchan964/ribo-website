export type CloudinaryMediaDoc = {
  url?: string | null;
  mimeType?: string | null;
  cloudinaryPublicId?: string | null;
  filename?: string | null;
};

function readCloudName(): string | undefined {
  const value =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim();
  return value || undefined;
}

/**
 * 解析媒体文档的 Cloudinary 交付 URL（永不返回 /var/task/media 类本地路径）。
 */
export function resolveCloudinaryMediaUrl(
  doc: CloudinaryMediaDoc,
): string | null {
  const rawUrl = typeof doc.url === "string" ? doc.url.trim() : "";

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  const publicId =
    (typeof doc.cloudinaryPublicId === "string" && doc.cloudinaryPublicId) ||
    (rawUrl && !rawUrl.startsWith("/") && !rawUrl.includes("\\")
      ? rawUrl
      : null);

  if (!publicId) {
    return null;
  }

  const cloudName = readCloudName();
  if (!cloudName) return null;

  const isVideo = String(doc.mimeType ?? "").startsWith("video/");
  const resourceType = isVideo ? "video" : "image";
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`;
}

/** Admin 列表缩略图（小图） */
export function resolveCloudinaryAdminThumbnail(
  doc: CloudinaryMediaDoc,
): string | null {
  const base = resolveCloudinaryMediaUrl(doc);
  if (!base) return null;

  if (String(doc.mimeType ?? "").startsWith("video/")) {
    return base;
  }

  const cloudName = readCloudName();
  const publicId =
    (typeof doc.cloudinaryPublicId === "string" && doc.cloudinaryPublicId) ||
    null;

  if (!cloudName || !publicId) return base;

  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_200,h_200,q_auto,f_auto/${publicId}`;
}
