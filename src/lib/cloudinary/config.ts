export type CloudinaryResourceType = "image" | "video" | "auto";

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  imageFolder: string;
  videoFolder: string;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** 服务端完整配置（含 API Secret，勿暴露到客户端） */
export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName =
    readEnv("CLOUDINARY_CLOUD_NAME") ??
    readEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");

  const apiKey = readEnv("CLOUDINARY_API_KEY");
  const apiSecret = readEnv("CLOUDINARY_API_SECRET");

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const baseFolder = readEnv("CLOUDINARY_UPLOAD_FOLDER") ?? "ribo/products";

  return {
    cloudName,
    apiKey,
    apiSecret,
    imageFolder: readEnv("CLOUDINARY_IMAGE_FOLDER") ?? `${baseFolder}/images`,
    videoFolder: readEnv("CLOUDINARY_VIDEO_FOLDER") ?? `${baseFolder}/videos`,
  };
}

/** 客户端可用的公开配置 */
export function getCloudinaryPublicConfig() {
  const cloudName = readEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");

  if (!cloudName) {
    throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.");
  }

  return { cloudName };
}

export function getCloudinaryUploadPreset(): string | undefined {
  return readEnv("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
}

export function isCloudinaryConfigured(): boolean {
  const cloudName =
    readEnv("CLOUDINARY_CLOUD_NAME") ??
    readEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  return Boolean(
    cloudName && readEnv("CLOUDINARY_API_KEY") && readEnv("CLOUDINARY_API_SECRET"),
  );
}

/** 浏览器直传 Cloudinary（未签名 preset 或完整签名配置） */
export function isCloudinaryClientUploadReady(): boolean {
  const cloudName = readEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  if (!cloudName) return false;
  if (getCloudinaryUploadPreset()) return true;
  return isCloudinaryConfigured();
}

export function resolveUploadFolder(
  resourceType: CloudinaryResourceType,
  folder?: string,
): string {
  if (folder) return folder;
  const config = getCloudinaryConfig();
  if (resourceType === "video") return config.videoFolder;
  if (resourceType === "image") return config.imageFolder;
  return config.imageFolder;
}

export function getUploadEndpoint(
  cloudName: string,
  resourceType: CloudinaryResourceType,
): string {
  const type =
    resourceType === "video"
      ? "video"
      : resourceType === "image"
        ? "image"
        : "auto";
  return `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;
}
