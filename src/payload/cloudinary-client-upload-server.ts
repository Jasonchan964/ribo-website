import type { PayloadHandler } from "payload";
import { APIError, Forbidden } from "payload";
import {
  isCloudinaryClientUploadReady,
  type CloudinaryResourceType,
} from "@/lib/cloudinary/config";
import { resourceTypeFromMime } from "@/lib/cloudinary/client-upload-context";
import { createClientUploadParams } from "@/lib/cloudinary/upload-params";

type SignBody = {
  collectionSlug?: string;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  resourceType?: CloudinaryResourceType;
  folder?: string;
};

/** Payload admin：仅返回直传参数（签名或未签名 preset），不接收文件字节。 */
export const cloudinaryClientUploadServerHandler: PayloadHandler = async (req) => {
  if (!isCloudinaryClientUploadReady()) {
    throw new APIError(
      "Cloudinary client upload is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and either NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET or server signing credentials.",
      503,
    );
  }

  if (!req.user) {
    throw new Forbidden();
  }

  if (!req.json) {
    throw new APIError("Invalid request.", 400);
  }

  const body = (await req.json()) as SignBody;
  const mimeType = body.mimeType ?? "application/octet-stream";
  const resourceType =
    body.resourceType ?? resourceTypeFromMime(mimeType);

  if (!["image", "video", "auto"].includes(resourceType)) {
    throw new APIError("Invalid resourceType.", 400);
  }

  const payload = createClientUploadParams({
    resourceType,
    folder: body.folder,
  });

  return Response.json(payload);
};
