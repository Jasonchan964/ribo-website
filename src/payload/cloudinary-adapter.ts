import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import { APIError } from "payload";
import { resolveCloudinaryMediaUrl } from "../lib/cloudinary/delivery";
import { isCloudinaryConfigured } from "../lib/cloudinary/config";
import {
  isCloudinaryClientUploadContext,
} from "../lib/cloudinary/client-upload-context";

export const cloudinaryAdapter: Adapter = () => ({
  name: "cloudinary",

  clientUploads: {
    access: ({ req }) => Boolean(req.user),
  },

  async handleUpload({ clientUploadContext }) {
    if (!isCloudinaryClientUploadContext(clientUploadContext)) {
      throw new APIError(
        "Media must be uploaded directly from the browser to Cloudinary. Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (or signing keys), then reload the admin.",
        400,
      );
    }

    const ctx = clientUploadContext;
    return {
      filename: ctx.payloadFilename,
      url: ctx.secureUrl,
      mimeType: ctx.mimeType,
      filesize: ctx.bytes,
      width: ctx.width,
      height: ctx.height,
      cloudinaryPublicId: ctx.publicId,
    };
  },

  async handleDelete({ doc }) {
    if (!isCloudinaryConfigured()) return;

    const record = doc as {
      cloudinaryPublicId?: string;
      filename?: string;
      mimeType?: string;
    };

    const publicId =
      typeof record.cloudinaryPublicId === "string"
        ? record.cloudinaryPublicId
        : typeof record.filename === "string"
          ? record.filename
          : null;

    if (!publicId) return;

    const { getCloudinaryServer } = await import("../lib/cloudinary/server");
    const cloudinary = getCloudinaryServer();
    const resourceType = String(record.mimeType ?? "").startsWith("video/")
      ? "video"
      : "image";

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  },

  generateURL({ data }) {
    if (!data) return "";
    const url = resolveCloudinaryMediaUrl({
      url: typeof data.url === "string" ? data.url : null,
      mimeType: typeof data.mimeType === "string" ? data.mimeType : null,
      cloudinaryPublicId:
        typeof data.cloudinaryPublicId === "string"
          ? data.cloudinaryPublicId
          : null,
      filename: typeof data.filename === "string" ? data.filename : null,
    });
    return url ?? "";
  },

  /**
   * 客户端直传登记时：返回空 body，避免 Payload 跟随 302 从 Cloudinary 拉回整文件（会卡死并占满 Vercel）。
   * 真实 URL / 元数据由 clientUploadContext + beforeChange hooks 写入数据库。
   */
  staticHandler(_req, { doc, params }) {
    const clientContext = isCloudinaryClientUploadContext(
      params?.clientUploadContext,
    )
      ? params.clientUploadContext
      : null;

    if (clientContext) {
      return new Response(Buffer.alloc(0), {
        status: 200,
        headers: {
          "Content-Type": clientContext.mimeType,
          "Content-Length": "0",
        },
      });
    }

    const fileDoc = doc as { url?: string | null; mimeType?: string | null } | undefined;
    const url =
      typeof fileDoc?.url === "string" && fileDoc.url.startsWith("http")
        ? fileDoc.url
        : resolveCloudinaryMediaUrl({
            url: fileDoc?.url ?? null,
            mimeType: fileDoc?.mimeType ?? null,
            cloudinaryPublicId: null,
            filename: null,
          });

    if (!url) {
      return new Response("Not found", { status: 404 });
    }

    return Response.redirect(url, 302);
  },
});
