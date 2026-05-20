import type { UploadSignaturePayload } from "@/lib/cloudinary/sign";
import {
  mapCloudinaryResponse,
  type CloudinaryApiResponse,
  type CloudinaryUploadResult,
} from "@/lib/cloudinary/types";
import type { CloudinaryResourceType } from "@/lib/cloudinary/config";

export type UploadMediaOptions = {
  file: File;
  resourceType: CloudinaryResourceType;
  folder?: string;
  /** 与 UPLOAD_AUTH_SECRET 对应，保护签名接口 */
  authToken?: string;
  onProgress?: (percent: number) => void;
};

async function fetchUploadSignature(
  options: Pick<UploadMediaOptions, "resourceType" | "folder" | "authToken">,
): Promise<UploadSignaturePayload> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (options.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }

  const response = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers,
    body: JSON.stringify({
      resourceType: options.resourceType,
      folder: options.folder,
    }),
  });

  const data = (await response.json()) as UploadSignaturePayload & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to get upload signature.");
  }

  return data;
}

export async function uploadMediaToCloudinary(
  options: UploadMediaOptions,
): Promise<CloudinaryUploadResult> {
  const signature = await fetchUploadSignature(options);

  const formData = new FormData();
  formData.append("file", options.file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", signature.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !options.onProgress) return;
      options.onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as CloudinaryApiResponse;
        if (xhr.status >= 400 || data.error) {
          reject(new Error(data.error?.message ?? "Cloudinary upload failed."));
          return;
        }
        resolve(mapCloudinaryResponse(data));
      } catch {
        reject(new Error("Invalid response from Cloudinary."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}
