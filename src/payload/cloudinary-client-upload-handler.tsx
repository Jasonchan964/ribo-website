"use client";

import { createClientUploadHandler } from "@payloadcms/plugin-cloud-storage/client";
import { formatAdminURL } from "payload/shared";
import type { CloudinaryClientUploadContext } from "@/lib/cloudinary/client-upload-context";
import { resourceTypeFromMime } from "@/lib/cloudinary/client-upload-context";
import {
  buildPayloadFilename,
  resolveMimeType,
} from "@/lib/cloudinary/mime";
import { resolveUploadFolderPublic } from "@/lib/cloudinary/config";
import type { ClientUploadParams } from "@/lib/cloudinary/upload-params.types";
import { uploadMediaToCloudinary } from "@/lib/cloudinary/upload-client";

export const CloudinaryClientUploadHandler = createClientUploadHandler({
  handler: async ({
    apiRoute,
    file,
    serverHandlerPath,
    serverURL,
    updateFilename,
  }) => {
    const resourceType = resourceTypeFromMime(file.type);
    const folder = resolveUploadFolderPublic(resourceType);

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
        folder,
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
        "Failed to get Cloudinary upload parameters.";
      throw new Error(message);
    }

    const uploadParams = (await signResponse.json()) as ClientUploadParams;

    const result = await uploadMediaToCloudinary({
      file,
      resourceType,
      folder,
      uploadParams,
    });

    const mimeType = resolveMimeType({
      fileType: file.type,
      format: result.format,
      resourceType: result.resourceType as "image" | "video",
    });

    const payloadFilename = buildPayloadFilename(file.name, result.format);

    updateFilename(payloadFilename);

    const context: CloudinaryClientUploadContext = {
      publicId: result.publicId,
      secureUrl: result.secureUrl,
      resourceType: result.resourceType as "image" | "video",
      mimeType,
      payloadFilename,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
      format: result.format,
    };

    return context;
  },
});
