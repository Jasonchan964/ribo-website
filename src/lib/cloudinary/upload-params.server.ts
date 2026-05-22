import {
  getCloudinaryPublicConfig,
  getCloudinaryUploadPreset,
  getUploadEndpoint,
  resolveUploadFolder,
  type CloudinaryResourceType,
} from "./config";
import { createUploadSignature } from "./sign.server";
import type { ClientUploadParams } from "./upload-params.types";

/** 服务端：生成浏览器直传参数（未签名 preset 或签名） */
export function createClientUploadParams(options: {
  resourceType?: CloudinaryResourceType;
  folder?: string;
}): ClientUploadParams {
  const resourceType = options.resourceType ?? "image";
  const folder = resolveUploadFolder(resourceType, options.folder);
  const preset = getCloudinaryUploadPreset();

  if (preset) {
    const { cloudName } = getCloudinaryPublicConfig();
    return {
      mode: "unsigned",
      cloudName,
      uploadPreset: preset,
      folder,
      uploadUrl: getUploadEndpoint(cloudName, resourceType),
      resourceType,
    };
  }

  return {
    mode: "signed",
    ...createUploadSignature({ resourceType, folder }),
  };
}
