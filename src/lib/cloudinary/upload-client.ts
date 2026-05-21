import type { UploadSignaturePayload } from "@/lib/cloudinary/sign";
import {
  mapCloudinaryResponse,
  type CloudinaryApiResponse,
  type CloudinaryUploadResult,
} from "@/lib/cloudinary/types";
import type { CloudinaryResourceType } from "@/lib/cloudinary/config";

/** Cloudinary recommends chunked uploads above ~20MB */
const CHUNK_THRESHOLD_BYTES = 20 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 6 * 1024 * 1024;

export type UploadMediaOptions = {
  file: File;
  resourceType: CloudinaryResourceType;
  folder?: string;
  /** 与 UPLOAD_AUTH_SECRET 对应，保护签名接口 */
  authToken?: string;
  /** 若已持有签名（如 Payload Admin），可跳过 /api/cloudinary/sign */
  signature?: UploadSignaturePayload;
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

function appendSignedFields(
  formData: FormData,
  signature: UploadSignaturePayload,
  extra?: Record<string, string>,
) {
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      formData.append(key, value);
    }
  }
}

function uploadWithXhr(
  uploadUrl: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
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

async function uploadChunked(
  file: File,
  signature: UploadSignaturePayload,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const total = file.size;
  const chunkSize = CHUNK_SIZE_BYTES;
  let start = 0;
  let result: CloudinaryUploadResult | null = null;

  while (start < total) {
    const end = Math.min(start + chunkSize, total);
    const chunk = file.slice(start, end);
    const formData = new FormData();
    formData.append("file", chunk);
    appendSignedFields(formData, signature, {
      chunk_size: String(chunkSize),
    });

    result = await uploadWithXhr(signature.uploadUrl, formData, (chunkPercent) => {
      if (!onProgress) return;
      const overall = Math.round(
        ((start + (chunkPercent / 100) * (end - start)) / total) * 100,
      );
      onProgress(Math.min(overall, 99));
    });

    start = end;
  }

  if (!result) {
    throw new Error("Chunked upload produced no result.");
  }

  onProgress?.(100);
  return result;
}

export async function uploadMediaToCloudinary(
  options: UploadMediaOptions,
): Promise<CloudinaryUploadResult> {
  const signature =
    options.signature ?? (await fetchUploadSignature(options));

  if (options.file.size > CHUNK_THRESHOLD_BYTES) {
    return uploadChunked(options.file, signature, options.onProgress);
  }

  const formData = new FormData();
  formData.append("file", options.file);
  appendSignedFields(formData, signature);

  return uploadWithXhr(signature.uploadUrl, formData, options.onProgress);
}
