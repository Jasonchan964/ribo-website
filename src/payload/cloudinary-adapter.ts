import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import type { UploadApiResponse } from "cloudinary";
import {
  getCloudinaryConfig,
  isCloudinaryConfigured,
  resolveUploadFolder,
} from "../lib/cloudinary/config";
import {
  isCloudinaryClientUploadContext,
  resourceTypeFromMime,
} from "../lib/cloudinary/client-upload-context";
import { getCloudinaryServer } from "../lib/cloudinary/server";

function uploadBuffer(
  buffer: Buffer,
  options: { folder: string; resourceType: "image" | "video" },
): Promise<UploadApiResponse> {
  const cloudinary = getCloudinaryServer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else if (!result) reject(new Error("Cloudinary upload returned no result."));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export const cloudinaryAdapter: Adapter = () => ({
  name: "cloudinary",

  /**
   * When true, Payload Admin uploads via CloudinaryClientUploadHandler (browser → Cloudinary).
   * Server-side handleUpload remains for small legacy/multipart uploads.
   */
  clientUploads: {
    access: ({ req }) => Boolean(req.user),
  },

  async handleUpload({ file, clientUploadContext }) {
    if (isCloudinaryClientUploadContext(clientUploadContext)) {
      const ctx = clientUploadContext;
      return {
        filename: ctx.publicId,
        url: ctx.secureUrl,
        mimeType: ctx.mimeType,
        filesize: ctx.bytes,
        width: ctx.width,
        height: ctx.height,
        cloudinaryPublicId: ctx.publicId,
      };
    }

    const resourceType = resourceTypeFromMime(file.mimeType);
    const folder = resolveUploadFolder(resourceType);
    const result = await uploadBuffer(file.buffer, { folder, resourceType });

    return {
      filename: result.public_id,
      url: result.secure_url,
      mimeType: file.mimeType,
      filesize: result.bytes,
      width: result.width,
      height: result.height,
      cloudinaryPublicId: result.public_id,
    };
  },

  async handleDelete({ doc }) {
    if (!isCloudinaryConfigured()) return;

    const publicId = doc.filename;

    if (!publicId) return;

    const cloudinary = getCloudinaryServer();
    const resourceType = String(doc.mimeType ?? "").startsWith("video/")
      ? "video"
      : "image";

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  },

  generateURL({ data }) {
    if (typeof data?.url === "string") return data.url;
    const publicId =
      typeof data?.cloudinaryPublicId === "string"
        ? data.cloudinaryPublicId
        : data?.filename;
    if (!publicId) return "";

    const { cloudName } = getCloudinaryConfig();
    const resourceType = String(data?.mimeType ?? "").startsWith("video/")
      ? "video"
      : "image";
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`;
  },

  staticHandler(_req, { doc, params }) {
    const clientContext = isCloudinaryClientUploadContext(
      params?.clientUploadContext,
    )
      ? params.clientUploadContext
      : null;

    if (clientContext) {
      const isVideo =
        clientContext.resourceType === "video" ||
        clientContext.mimeType.startsWith("video/");

      // Avoid pulling multi‑MB video through Vercel when registering the media doc.
      if (isVideo) {
        return new Response(Buffer.alloc(0), {
          status: 200,
          headers: {
            "Content-Type": clientContext.mimeType,
            "Content-Length": "0",
          },
        });
      }

      if (clientContext.secureUrl) {
        return Response.redirect(clientContext.secureUrl, 302);
      }
    }

    const fileDoc = doc as { url?: string | null } | undefined;
    const url = typeof fileDoc?.url === "string" ? fileDoc.url : "";

    if (!url) {
      return new Response("Not found", { status: 404 });
    }

    return Response.redirect(url, 302);
  },
});
