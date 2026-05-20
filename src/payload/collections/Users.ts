import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "管理员",
    plural: "管理员",
  },
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "系统",
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "姓名",
    },
  ],
};
