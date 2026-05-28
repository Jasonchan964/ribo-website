import type { CollectionConfig } from "payload";
import {
  cloudinaryClientUploadBeforeChange,
  cloudinaryClientUploadBeforeOperation,
  cloudinaryClientUploadBeforeValidate,
  cloudinaryMediaAfterRead,
  getCloudinaryAdminThumbnail,
} from "../hooks/cloudinary-media-upload";
import type { CloudinaryMediaDoc } from "@/lib/cloudinary/delivery";

/**
 * 媒体仅托管在 Cloudinary：
 * - disableLocalStorage: true → 永不读写 /var/task/media
 * - Admin 通过 clientUploads 直传 Cloudinary，保存时只提交 URL / public_id 元数据到 Neon
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "媒体文件",
    plural: "媒体库",
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "mimeType", "updatedAt"],
    group: "内容",
    description:
      "视频/图片请先等待 Cloudinary 直传进度 100%，再点保存。勿将大文件发往服务器。",
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    bulkUpload: true,
    disableLocalStorage: true,
    pasteURL: false,
    focalPoint: false,
    adminThumbnail: ({ doc }) =>
      getCloudinaryAdminThumbnail(doc as CloudinaryMediaDoc),
  },
  hooks: {
    beforeOperation: [cloudinaryClientUploadBeforeOperation],
    beforeValidate: [cloudinaryClientUploadBeforeValidate],
    beforeChange: [cloudinaryClientUploadBeforeChange],
    afterRead: [cloudinaryMediaAfterRead],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "替代文本（无障碍 / SEO）",
    },
    {
      name: "cloudinaryPublicId",
      type: "text",
      label: "Cloudinary Public ID",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Cloudinary 资源路径，用于 CDN 与删除。",
      },
    },
  ],
};
