import type { CloudinaryResourceType } from "./config";

/** Returned by client upload handlers and stored on req.file.clientUploadContext */
export type CloudinaryClientUploadContext = {
  publicId: string;
  secureUrl: string;
  resourceType: CloudinaryResourceType;
  /** 浏览器 File.type 或根据 Cloudinary format 推断的真实 MIME */
  mimeType: string;
  /** Payload 展示/校验用文件名（含扩展名，非 public_id 路径） */
  payloadFilename: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
};

export function isCloudinaryClientUploadContext(
  value: unknown,
): value is CloudinaryClientUploadContext {
  if (!value || typeof value !== "object") return false;
  const ctx = value as CloudinaryClientUploadContext;
  return (
    typeof ctx.publicId === "string" &&
    typeof ctx.secureUrl === "string" &&
    typeof ctx.mimeType === "string" &&
    typeof ctx.payloadFilename === "string"
  );
}

export function resourceTypeFromMime(mimeType: string): "image" | "video" {
  return mimeType.startsWith("video/") ? "video" : "image";
}
