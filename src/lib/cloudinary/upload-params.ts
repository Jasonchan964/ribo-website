import {
  getCloudinaryPublicConfig,
  getCloudinaryUploadPreset,
  getUploadEndpoint,
  resolveUploadFolder,
  type CloudinaryResourceType,
} from "./config";
import { createUploadSignature, type UploadSignaturePayload } from "./sign";

export type UnsignedUploadParams = {
  mode: "unsigned";
  cloudName: string;
  uploadPreset: string;
  uploadUrl: string;
  folder: string;
  resourceType: CloudinaryResourceType;
};

export type SignedUploadParams = UploadSignaturePayload & {
  mode: "signed";
};

export type ClientUploadParams = UnsignedUploadParams | SignedUploadParams;

export function usesUnsignedCloudinaryUpload(): boolean {
  return Boolean(getCloudinaryUploadPreset());
}

/** 浏览器直传所需参数（未签名 preset 或服务端签名二选一） */
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
