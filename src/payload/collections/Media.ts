import type { CollectionConfig } from "payload";
import {
  cloudinaryClientUploadBeforeChange,
  cloudinaryClientUploadBeforeValidate,
} from "../hooks/cloudinary-client-upload";

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
      "图片与视频从浏览器直传 Cloudinary（不经 Vercel）。请使用上传按钮选择文件，等待进度完成后再保存。",
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    bulkUpload: true,
  },
  hooks: {
    beforeValidate: [cloudinaryClientUploadBeforeValidate],
    beforeChange: [cloudinaryClientUploadBeforeChange],
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
        description: "Cloudinary 资源路径（非 MIME），用于删除与 CDN 引用。",
      },
    },
  ],
};
