import type { CloudinaryResourceType } from "@/lib/cloudinary/config";
import type { ClientUploadParams } from "@/lib/cloudinary/upload-params.types";
import type { CloudinaryApiResponse, CloudinaryUploadResult } from "@/lib/cloudinary/types";
import { mapCloudinaryResponse } from "@/lib/cloudinary/types";
import { mimeFromFilename } from "@/lib/cloudinary/mime";

/** Cloudinary recommends chunked uploads above ~20MB */
const CHUNK_THRESHOLD_BYTES = 20 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 6 * 1024 * 1024;

type CloudinaryChunkApiResponse = CloudinaryApiResponse & {
  done?: boolean;
};

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

function hasTrustedBinaryMime(type: string): boolean {
  const normalized = type.trim().toLowerCase();
  return (
    normalized.startsWith("image/") ||
    normalized.startsWith("video/")
  ) && !normalized.startsWith("text/");
}

/**
 * 浏览器常把 PNG 标成 text/plain，导致 Cloudinary 拒绝。
 * 用扩展名重建带正确 MIME 的 File，保证 multipart 部件为 image/png 等。
 */
export function ensureBinaryUploadFile(
  file: File,
  resourceType: CloudinaryResourceType,
): File {
  if (hasTrustedBinaryMime(file.type)) {
    return file;
  }

  const type = mimeFromFilename(file.name, resourceType);
  return new File([file], file.name, {
    type,
    lastModified: file.lastModified,
  });
}

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

  if (params.resourceType === "video") {
    formData.append("resource_type", "video");
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      formData.append(key, value);
    }
  }
}

function buildUploadFormData(
  file: File,
  params: ClientUploadParams,
  extra?: Record<string, string>,
): FormData {
  const formData = new FormData();
  formData.append("file", file, file.name);
  appendDirectUploadFields(formData, params, extra);
  return formData;
}

function parseCloudinaryUploadResponse(
  status: number,
  bodyText: string,
): CloudinaryUploadResult {
  let data: CloudinaryApiResponse;
  try {
    data = JSON.parse(bodyText) as CloudinaryApiResponse;
  } catch {
    throw new Error("Invalid response from Cloudinary.");
  }

  if (status >= 400 || data.error) {
    throw new Error(data.error?.message ?? "Cloudinary upload failed.");
  }

  return mapCloudinaryResponse(data);
}

function parseCloudinaryChunkResponse(
  status: number,
  bodyText: string,
): CloudinaryChunkApiResponse {
  let data: CloudinaryChunkApiResponse;
  try {
    data = JSON.parse(bodyText) as CloudinaryChunkApiResponse;
  } catch {
    throw new Error("Invalid response from Cloudinary.");
  }

  if (status >= 400 || data.error) {
    throw new Error(data.error?.message ?? "Cloudinary upload failed.");
  }

  return data;
}

/**
 * 标准直传：仅 POST + FormData，由浏览器生成 multipart boundary。
 * 切勿设置 Content-Type（勿用 text/plain / application/json）。
 */
async function uploadWithFetch(
  uploadUrl: string,
  formData: FormData,
): Promise<CloudinaryUploadResult> {
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const bodyText = await response.text();
  return parseCloudinaryUploadResponse(response.status, bodyText);
}

/** 需要上传进度时使用 XHR（同样不设置 Content-Type）。 */
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
        resolve(parseCloudinaryUploadResponse(xhr.status, xhr.responseText));
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Cloudinary upload failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}

async function uploadToCloudinary(
  uploadUrl: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  if (onProgress) {
    return uploadWithXhr(uploadUrl, formData, onProgress);
  }
  return uploadWithFetch(uploadUrl, formData);
}

async function uploadChunked(
  file: File,
  params: ClientUploadParams,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const total = file.size;
  const chunkSize = CHUNK_SIZE_BYTES;
  let start = 0;
  const uploadUrl = params.uploadUrl;
  const chunkMime = file.type || mimeFromFilename(file.name, params.resourceType);
  const uploadId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let finalResponse: CloudinaryChunkApiResponse | null = null;

  while (start < total) {
    const end = Math.min(start + chunkSize, total);
    const slice = file.slice(start, end);
    const chunkBlob =
      slice.type && hasTrustedBinaryMime(slice.type)
        ? slice
        : new Blob([slice], { type: chunkMime });
    const formData = buildUploadFormData(
      new File([chunkBlob], file.name, { type: chunkMime }),
      params,
    );

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Range": `bytes ${start}-${end - 1}/${total}`,
        "X-Unique-Upload-Id": uploadId,
      },
      body: formData,
    });

    const bodyText = await response.text();
    const data = parseCloudinaryChunkResponse(response.status, bodyText);

    start = end;
    onProgress?.(Math.min(Math.round((start / total) * 100), 99));

    if (data.done === true || start === total) {
      finalResponse = data;
    }
  }

  if (!finalResponse || finalResponse.done === false) {
    throw new Error("Chunked upload did not complete.");
  }

  onProgress?.(100);
  return mapCloudinaryResponse(finalResponse);
}

/**
 * 浏览器 → Cloudinary 直传（不经过 Vercel 请求体）。
 * FormData：`file` 为原始 File/Blob 二进制，`upload_preset` / `folder` 等字段单独 append。
 */
export async function uploadMediaToCloudinary(
  options: UploadMediaOptions,
): Promise<CloudinaryUploadResult> {
  const params =
    options.uploadParams ??
    (await fetchClientUploadParams(options));

  const file = ensureBinaryUploadFile(options.file, options.resourceType);

  if (file.size > CHUNK_THRESHOLD_BYTES) {
    return uploadChunked(file, params, options.onProgress);
  }

  const formData = buildUploadFormData(file, params);
  return uploadToCloudinary(params.uploadUrl, formData, options.onProgress);
}
