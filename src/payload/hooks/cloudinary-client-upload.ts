import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
} from "payload";
import {
  applyCloudinaryClientUploadToData,
  getCloudinaryClientUploadContext,
} from "@/lib/cloudinary/client-upload-doc";
import { isCloudinaryClientUploadReady } from "@/lib/cloudinary/config";
import { APIError } from "payload";

function applyClientContext<T extends Record<string, unknown>>(
  data: T | undefined,
  req: Parameters<CollectionBeforeChangeHook>[0]["req"],
): T {
  const base = (data ?? {}) as T;
  const ctx = getCloudinaryClientUploadContext(req);
  if (!ctx) return base;
  return applyCloudinaryClientUploadToData(base, ctx);
}

/** 在 Payload 从 filename 推断 MIME 之前写入真实 mimeType */
export const cloudinaryClientUploadBeforeValidate: CollectionBeforeValidateHook =
  ({ data, req }) => applyClientContext(data, req);

/** 持久化 Cloudinary URL、public_id 与准确元数据 */
export const cloudinaryClientUploadBeforeChange: CollectionBeforeChangeHook = ({
  data,
  req,
  operation,
}) => {
  const ctx = getCloudinaryClientUploadContext(req);

  if (
    isCloudinaryClientUploadReady() &&
    operation === "create" &&
    req.file &&
    !ctx
  ) {
    throw new APIError(
      "Upload must complete via browser direct upload to Cloudinary before saving. Retry after the file shows 100% uploaded.",
      400,
    );
  }

  return applyClientContext(data, req);
};
