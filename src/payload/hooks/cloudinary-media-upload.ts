import type {
  CollectionAfterReadHook,
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
} from "payload";
import { APIError } from "payload";
import {
  applyCloudinaryClientUploadToData,
  getCloudinaryClientUploadContext,
} from "@/lib/cloudinary/client-upload-doc";
import {
  isCloudinaryClientUploadReady,
  isCloudinaryMediaStorageEnabled,
} from "@/lib/cloudinary/config";
import {
  resolveCloudinaryAdminThumbnail,
  resolveCloudinaryMediaUrl,
  type CloudinaryMediaDoc,
} from "@/lib/cloudinary/delivery";

const MAX_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024;

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

const MINIMAL_MP4_HEADER = Buffer.from([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
  0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
  0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
]);

function prepareClientUploadPlaceholder(
  req: Parameters<CollectionBeforeOperationHook>[0]["req"],
): void {
  const ctx = getCloudinaryClientUploadContext(req);
  if (!ctx || !req.file) return;

  const placeholder =
    ctx.resourceType === "video" ? MINIMAL_MP4_HEADER : ONE_PIXEL_PNG;

  req.file.name = ctx.payloadFilename;
  req.file.mimetype = ctx.mimeType;
  req.file.data = placeholder;
  req.file.size = ctx.bytes;
  delete req.file.tempFilePath;
}

function applyClientContext<T extends Record<string, unknown>>(
  data: T | undefined,
  req: Parameters<CollectionBeforeChangeHook>[0]["req"],
): T {
  const base = (data ?? {}) as T;
  const ctx = getCloudinaryClientUploadContext(req);
  if (!ctx) return base;
  return applyCloudinaryClientUploadToData(base, ctx);
}

function enforceDirectUploadOnly(
  req: Parameters<CollectionBeforeChangeHook>[0]["req"],
  operation: string,
): void {
  if (!isCloudinaryMediaStorageEnabled() || operation !== "create") return;

  const ctx = getCloudinaryClientUploadContext(req);
  if (ctx) {
    if (req.file) {
      req.file.data = Buffer.alloc(0);
      req.file.size = ctx.bytes;
    }
    return;
  }

  const file = req.file;
  if (!file) return;

  const bufferSize = file.data?.length ?? file.size ?? 0;
  if (bufferSize > MAX_SERVER_UPLOAD_BYTES) {
    throw new APIError(
      `File is too large for server upload (${Math.round(bufferSize / 1024 / 1024)} MB). Upload must go directly to Cloudinary from the browser.`,
      413,
    );
  }

  if (isCloudinaryClientUploadReady() && bufferSize > 0) {
    throw new APIError(
      "Do not send file bytes to /api/media. Wait for Cloudinary direct upload to finish, then save.",
      400,
    );
  }
}

export const cloudinaryClientUploadBeforeValidate: CollectionBeforeValidateHook =
  ({ data, req }) => applyClientContext(data, req);

export const cloudinaryClientUploadBeforeOperation: CollectionBeforeOperationHook =
  ({ args, operation, req }) => {
    if (operation === "create") {
      prepareClientUploadPlaceholder(req);
    }

    return args;
  };

export const cloudinaryClientUploadBeforeChange: CollectionBeforeChangeHook = ({
  data,
  req,
  operation,
}) => {
  enforceDirectUploadOnly(req, operation);

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

export const cloudinaryMediaAfterRead: CollectionAfterReadHook = ({ doc }) => {
  if (!doc || !isCloudinaryMediaStorageEnabled()) return doc;

  const deliveryUrl = resolveCloudinaryMediaUrl(doc as CloudinaryMediaDoc);
  if (!deliveryUrl) return doc;

  return {
    ...doc,
    url: deliveryUrl,
  };
};

export function getCloudinaryAdminThumbnail(
  doc: CloudinaryMediaDoc,
): string | false | null {
  return resolveCloudinaryAdminThumbnail(doc) ?? false;
}
