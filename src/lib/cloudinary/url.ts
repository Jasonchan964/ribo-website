/**
 * 生成 Cloudinary 交付 URL（用于 next/image 或 <video src>）
 * @see https://cloudinary.com/documentation/image_transformations
 */
export function cloudinaryImageUrl(
  publicIdOrUrl: string,
  options?: {
    width?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg";
  },
): string {
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicIdOrUrl;

  const transforms = [
    "f_auto",
    "q_auto",
    options?.width ? `w_${options.width}` : null,
    options?.format && options.format !== "auto" ? `f_${options.format}` : null,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicIdOrUrl}`;
}

export function cloudinaryVideoUrl(publicIdOrUrl: string): string {
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicIdOrUrl;

  return `https://res.cloudinary.com/${cloudName}/video/upload/q_auto/${publicIdOrUrl}`;
}
