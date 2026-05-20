export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  folder?: string;
};

export type CloudinaryApiResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  duration?: number;
  error?: { message: string };
};

export function mapCloudinaryResponse(
  data: CloudinaryApiResponse,
): CloudinaryUploadResult {
  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    width: data.width,
    height: data.height,
    duration: data.duration,
    bytes: data.bytes,
    folder: data.folder,
  };
}
