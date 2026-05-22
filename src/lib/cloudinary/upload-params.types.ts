import type { CloudinaryResourceType } from "./config";
import { getCloudinaryUploadPreset } from "./config";

export type UploadSignaturePayload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
  resourceType: CloudinaryResourceType;
};

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
