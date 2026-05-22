import type { PayloadRequest } from "payload";
import {
  isCloudinaryClientUploadContext,
  type CloudinaryClientUploadContext,
} from "./client-upload-context";

export function getCloudinaryClientUploadContext(
  req: PayloadRequest,
): CloudinaryClientUploadContext | null {
  const ctx = req.file?.clientUploadContext;
  if (!isCloudinaryClientUploadContext(ctx)) return null;
  return ctx;
}

export function applyCloudinaryClientUploadToData<T extends Record<string, unknown>>(
  data: T,
  ctx: CloudinaryClientUploadContext,
): T {
  return {
    ...data,
    filename: ctx.payloadFilename,
    url: ctx.secureUrl,
    mimeType: ctx.mimeType,
    filesize: ctx.bytes,
    cloudinaryPublicId: ctx.publicId,
    ...(ctx.width != null ? { width: ctx.width } : {}),
    ...(ctx.height != null ? { height: ctx.height } : {}),
  };
}
