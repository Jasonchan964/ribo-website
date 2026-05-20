import type { CollectionConfig } from "payload";
import { localizedText } from "../fields/localized";
import { productsBeforeValidate } from "./products-hooks";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: "吹瓶机产品",
    plural: "吹瓶机产品",
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "titleEn", "featured", "updatedAt"],
    group: "内容",
  },
  hooks: {
    beforeValidate: [productsBeforeValidate],
  },
  fields: [
    {
      name: "titleEn",
      type: "text",
      label: "英文标题 (Title)",
      index: true,
      admin: {
        description:
          "用于自动生成 URL Slug（保存时转为小写、连字符）。若留空，会尝试使用下方「产品名称 · English」",
      },
    },
    {
      name: "slugManual",
      type: "checkbox",
      label: "手动编辑 URL Slug",
      defaultValue: false,
      admin: {
        description:
          "关闭：Slug 随英文标题（或名称英文）自动更新。开启：可自行编辑 Slug，不会被标题覆盖。",
        position: "sidebar",
      },
    },
    {
      name: "slug",
      type: "text",
      label: "URL Slug",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "对应 /cn/products/[slug]。默认由上方的英文标题自动生成；开启「手动编辑 URL Slug」后可自由修改。",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "首页推荐",
      defaultValue: false,
    },
    localizedText("name", "产品名称", { required: true }),
    localizedText("shortDescription", "简短描述", { required: true, textarea: true }),
    localizedText("description", "详细描述", { required: true, textarea: true }),
    {
      name: "mainImage",
      type: "upload",
      relationTo: "media",
      label: "主图",
      required: true,
    },
    {
      name: "gallery",
      type: "array",
      label: "产品图集",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
    {
      name: "video",
      type: "upload",
      relationTo: "media",
      label: "产品视频",
      admin: {
        description: "上传至 Cloudinary 的 MP4/WebM 等视频文件",
      },
    },
    {
      name: "videoUrl",
      type: "text",
      label: "外部视频链接（可选）",
      admin: {
        description: "YouTube 嵌入链接等；若已上传视频文件可留空",
      },
    },
    {
      name: "specifications",
      type: "array",
      label: "技术参数",
      fields: [
        localizedText("label", "参数名", { required: true }),
        localizedText("value", "数值", { required: true }),
        localizedText("unit", "单位"),
      ],
    },
    localizedText("metaKeywords", "SEO 关键词", {
      textarea: true,
    }),
    {
      name: "reviews",
      type: "array",
      label: "客户评价",
      fields: [
        localizedText("author", "客户名称", { required: true }),
        localizedText("reviewBody", "评价内容", { required: true, textarea: true }),
        {
          name: "ratingValue",
          type: "number",
          label: "评分 (1–5)",
          min: 1,
          max: 5,
          required: true,
        },
        {
          name: "datePublished",
          type: "date",
          label: "发布日期",
          required: true,
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      label: "上架日期",
      required: true,
      admin: { position: "sidebar" },
    },
  ],
  timestamps: true,
};
