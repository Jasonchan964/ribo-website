import type { CloudinaryResourceType } from "@/lib/cloudinary/config";
import type { ClientUploadParams } from "@/lib/cloudinary/upload-params.types";
import type { CloudinaryApiResponse, CloudinaryUploadResult } from "@/lib/cloudinary/types";
import { mapCloudinaryResponse } from "@/lib/cloudinary/types";

/** Cloudinary recommends chunked uploads above ~20MB */
const CHUNK_THRESHOLD_BYTES = 20 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 6 * 1024 * 1024;

export type UploadMediaOptions = {
  file: File;
  resourceType: CloudinaryResourceType;
  folder?: string;
  /** 与 UPLOAD_AUTH_SECRET 对应，保护签名接口 */
  authToken?: string;
  /** 若已持有上传参数（如 Payload Admin），可跳过 /api/cloudinary/sign */
  uploadParams?: ClientUploadParams;
  onProgress?: (percent: number) => void;
};

async function fetchClientUploadParams(
  options: Pick<UploadMediaOptions, "resourceType" | "folder" | "authToken">,
): Promise<ClientUploadParams> {
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

  const data = (await response.json()) as ClientUploadParams & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to get Cloudinary upload parameters.");
  }

  return data;
}

function appendDirectUploadFields(
  formData: FormData,
  params: ClientUploadParams,
  extra?: Record<string, string>,
) {
  if (params.mode === "unsigned") {
    formData.append("upload_preset", params.uploadPreset);
    formData.append("folder", params.folder);
  } else {
    formData.append("api_key", params.apiKey);
    formData.append("timestamp", String(params.timestamp));
    formData.append("signature", params.signature);
    formData.append("folder", params.folder);
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      formData.append(key, value);
    }
  }
}

function getUploadUrl(params: ClientUploadParams): string {
  return params.uploadUrl;
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
  params: ClientUploadParams,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const total = file.size;
  const chunkSize = CHUNK_SIZE_BYTES;
  let start = 0;
  let result: CloudinaryUploadResult | null = null;
  const uploadUrl = getUploadUrl(params);

  while (start < total) {
    const end = Math.min(start + chunkSize, total);
    const chunk = file.slice(start, end);
    const formData = new FormData();
    formData.append("file", chunk);
    appendDirectUploadFields(formData, params, {
      chunk_size: String(chunkSize),
    });

    result = await uploadWithXhr(uploadUrl, formData, (chunkPercent) => {
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

/**
 * 浏览器 → Cloudinary 直传（不经过 Vercel 请求体）。
 * 使用 FormData：`file`（二进制）、`folder`（目录参数）、以及 `upload_preset` 或签名参数。
 */
export async function uploadMediaToCloudinary(
  options: UploadMediaOptions,
): Promise<CloudinaryUploadResult> {
  const params =
    options.uploadParams ??
    (await fetchClientUploadParams(options));

  if (options.file.size > CHUNK_THRESHOLD_BYTES) {
    return uploadChunked(options.file, params, options.onProgress);
  }

  const formData = new FormData();
  formData.append("file", options.file);
  appendDirectUploadFields(formData, params);

  return uploadWithXhr(getUploadUrl(params), formData, options.onProgress);
}
