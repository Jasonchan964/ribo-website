import type { CollectionConfig } from "payload";
import {
  cloudinaryClientUploadBeforeChange,
  cloudinaryClientUploadBeforeValidate,
} from "../hooks/cloudinary-client-upload";
import {
  cloudinaryMediaAfterRead,
  getCloudinaryAdminThumbnail,
} from "../hooks/cloudinary-media-storage";
import type { CloudinaryMediaDoc } from "@/lib/cloudinary/delivery";
import { isCloudinaryMediaStorageEnabled } from "@/lib/cloudinary/config";

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
      "图片与视频从浏览器直传 Cloudinary（不经 Vercel 本地磁盘）。请使用上传按钮选择文件，等待进度完成后再保存。",
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    bulkUpload: true,
    /** 禁止 Payload 在 Vercel 等无状态环境读写 /var/task/media */
    disableLocalStorage: isCloudinaryMediaStorageEnabled(),
    adminThumbnail: ({ doc }) =>
      getCloudinaryAdminThumbnail(doc as CloudinaryMediaDoc),
  },
  hooks: {
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
        description: "Cloudinary 资源路径（非 MIME），用于删除与 CDN 引用。",
      },
    },
  ],
};
