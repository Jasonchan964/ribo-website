import type { PayloadHandler } from "payload";
import { APIError, Forbidden } from "payload";
import {
  isCloudinaryConfigured,
  type CloudinaryResourceType,
} from "@/lib/cloudinary/config";
import { createUploadSignature } from "@/lib/cloudinary/sign";
import { resourceTypeFromMime } from "@/lib/cloudinary/client-upload-context";

type SignBody = {
  collectionSlug?: string;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  resourceType?: CloudinaryResourceType;
};

/** Payload admin endpoint: returns Cloudinary signed upload params (no file bytes). */
export const cloudinaryClientUploadServerHandler: PayloadHandler = async (req) => {
  if (!isCloudinaryConfigured()) {
    throw new APIError("Cloudinary is not configured.", 503);
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

  const payload = createUploadSignature({ resourceType });

  return Response.json(payload);
};
