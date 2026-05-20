import type { CollectionConfig } from "payload";

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
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    bulkUpload: true,
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
      },
    },
  ],
};
