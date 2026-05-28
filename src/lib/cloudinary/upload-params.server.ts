import {
  getCloudinaryPublicConfig,
  getCloudinaryUploadPreset,
  getUploadEndpoint,
  resolveUploadFolderPublic,
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
  const preset = getCloudinaryUploadPreset();

  if (preset) {
    const { cloudName } = getCloudinaryPublicConfig();
    const folder = resolveUploadFolderPublic(resourceType, options.folder);
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
    ...createUploadSignature({
      resourceType,
      folder: options.folder,
    }),
  };
}
