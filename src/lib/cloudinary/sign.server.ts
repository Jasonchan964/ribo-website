import {
  getCloudinaryConfig,
  getUploadEndpoint,
  resolveUploadFolder,
  type CloudinaryResourceType,
} from "./config";
import { getCloudinaryServer } from "./server";
import type { UploadSignaturePayload } from "./upload-params.types";

export type { UploadSignaturePayload };

export function createUploadSignature(options: {
  resourceType?: CloudinaryResourceType;
  folder?: string;
}): UploadSignaturePayload {
  const config = getCloudinaryConfig();
  const cloudinary = getCloudinaryServer();
  const resourceType = options.resourceType ?? "image";
  const folder = resolveUploadFolder(resourceType, options.folder);
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    config.apiSecret,
  );

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    signature,
    folder,
    uploadUrl: getUploadEndpoint(config.cloudName, resourceType),
    resourceType,
  };
}
