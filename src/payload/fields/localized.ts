import type { Field } from "payload";

function localeField(
  name: "cn" | "en",
  label: string,
  type: "text" | "textarea",
  required?: boolean,
): Field {
  if (type === "textarea") {
    return {
      name,
      type: "textarea",
      label,
      required,
    };
  }

  return {
    name,
    type: "text",
    label,
    required,
  };
}

/** 中英双语字段组，对应站点 cn / en 路由 */
export function localizedText(
  name: string,
  label: string,
  options?: { required?: boolean; textarea?: boolean },
): Field {
  const type = options?.textarea ? "textarea" : "text";

  return {
    name,
    type: "group",
    label,
    fields: [
      localeField("cn", "中文", type, options?.required),
      localeField("en", "English", type, options?.required),
    ],
  };
}
