import type { CollectionBeforeValidateHook } from "payload";
import { slugifyEnglishTitle } from "../utilities/slugify";

type NameBlock = { en?: string | null; cn?: string | null };

function readTrimmedEnglishTitle(
  data: Record<string, unknown>,
  originalDoc?: Record<string, unknown>,
): string {
  const direct = typeof data.titleEn === "string" ? data.titleEn.trim() : "";
  if (direct) return direct;

  const name = (data.name ?? originalDoc?.name) as NameBlock | undefined;
  const fromName = typeof name?.en === "string" ? name.en.trim() : "";
  return fromName;
}

/**
 * 自动生成 slug：取自 `titleEn`，若无则取自分组字段 `name.en`。
 * 勾选 `slugManual` 时跳过自动写入，slug 可由编辑者完全手动维护。
 */
export const productsBeforeValidate: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
}) => {
  if (!data || (operation !== "create" && operation !== "update")) {
    return data;
  }

  const incoming = data as Record<string, unknown>;
  const previous = originalDoc as Record<string, unknown> | undefined;
  const manual = incoming.slugManual === true;

  if (manual) {
    return data;
  }

  const titleSource = readTrimmedEnglishTitle(incoming, previous);
  const nextSlug =
    titleSource !== "" ? slugifyEnglishTitle(titleSource) : undefined;

  if (nextSlug) {
    incoming.slug = nextSlug;
  } else if (operation === "update" && typeof previous?.slug === "string") {
    incoming.slug = previous.slug;
  }

  return data;
};
