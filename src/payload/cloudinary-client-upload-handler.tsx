"use client";

import { createClientUploadHandler } from "@payloadcms/plugin-cloud-storage/client";
import { formatAdminURL } from "payload/shared";
import type { CloudinaryClientUploadContext } from "@/lib/cloudinary/client-upload-context";
import { resourceTypeFromMime } from "@/lib/cloudinary/client-upload-context";
import { uploadMediaToCloudinary } from "@/lib/cloudinary/upload-client";
import type { CloudinaryResourceType } from "@/lib/cloudinary/config";

type SignResponse = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  cloudName: string;
  resourceType: CloudinaryResourceType;
};

export const CloudinaryClientUploadHandler = createClientUploadHandler({
  handler: async ({
    apiRoute,
    file,
    serverHandlerPath,
    serverURL,
    updateFilename,
  }) => {
    const resourceType = resourceTypeFromMime(file.type);

    const endpointRoute = formatAdminURL({
      apiRoute,
      path: serverHandlerPath,
      serverURL,
    });

    const signResponse = await fetch(endpointRoute, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        filesize: file.size,
        mimeType: file.type,
        resourceType,
      }),
    });

    if (!signResponse.ok) {
      const err = (await signResponse.json().catch(() => ({}))) as {
        errors?: { message: string }[];
        error?: string;
      };
      const message =
        err.errors?.map((e) => e.message).join(", ") ||
        err.error ||
        "Failed to get Cloudinary upload signature.";
      throw new Error(message);
    }

    const signature = (await signResponse.json()) as SignResponse;

    const result = await uploadMediaToCloudinary({
      file,
      resourceType,
      signature,
    });

    updateFilename(result.publicId);

    const context: CloudinaryClientUploadContext = {
      publicId: result.publicId,
      secureUrl: result.secureUrl,
      resourceType: result.resourceType as CloudinaryResourceType,
      mimeType: file.type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
      format: result.format,
    };

    return context;
  },
});
