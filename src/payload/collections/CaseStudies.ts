import type { CollectionConfig } from "payload";
import { localizedText } from "../fields/localized";

export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  labels: {
    singular: "客户案例",
    plural: "客户案例",
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "publishedAt"],
    group: "内容",
  },
  fields: [
    {
      name: "slug",
      type: "text",
      label: "URL Slug",
      required: true,
      unique: true,
      index: true,
    },
    localizedText("clientName", "客户名称", { required: true }),
    localizedText("projectDescription", "项目描述", {
      required: true,
      textarea: true,
    }),
    {
      name: "images",
      type: "array",
      label: "案例图片",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
    localizedText("industry", "行业"),
    localizedText("location", "地区"),
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      label: "关联产品",
    },
    {
      name: "publishedAt",
      type: "date",
      label: "发布日期",
      required: true,
      admin: { position: "sidebar" },
    },
  ],
  timestamps: true,
};
