import type { Config, Plugin } from "payload";
import { initClientUploads } from "@payloadcms/plugin-cloud-storage/utilities";
import { isCloudinaryConfigured } from "@/lib/cloudinary/config";
import { cloudinaryClientUploadServerHandler } from "./cloudinary-client-upload-server";

const CLIENT_HANDLER_PATH =
  "@/payload/cloudinary-client-upload-handler#CloudinaryClientUploadHandler";

const SERVER_HANDLER_PATH = "/cloudinary-client-upload";

/**
 * Registers Payload Admin client-side uploads for the media collection so files
 * go directly to Cloudinary (bypasses Vercel's ~4.5MB request body limit).
 */
export const cloudinaryClientUploadsPlugin: Plugin = (incomingConfig) => {
  const config = { ...incomingConfig };
  const enabled = isCloudinaryConfigured();

  // Always register paths so `payload generate:importmap` stays consistent.
  initClientUploads({
    clientHandler: CLIENT_HANDLER_PATH,
    collections: { media: true },
    config,
    enabled,
    serverHandler: cloudinaryClientUploadServerHandler,
    serverHandlerPath: SERVER_HANDLER_PATH,
  });

  return config;
};
