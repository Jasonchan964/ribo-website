import type { CollectionAfterReadHook } from "payload";
import {
  resolveCloudinaryAdminThumbnail,
  resolveCloudinaryMediaUrl,
  type CloudinaryMediaDoc,
} from "@/lib/cloudinary/delivery";
import { isCloudinaryMediaStorageEnabled } from "@/lib/cloudinary/config";

/** 读取时始终使用 Cloudinary URL，避免 Payload 访问本地 /media 路径 */
export const cloudinaryMediaAfterRead: CollectionAfterReadHook = ({ doc }) => {
  if (!doc || !isCloudinaryMediaStorageEnabled()) return doc;

  const record = doc as CloudinaryMediaDoc;
  const deliveryUrl = resolveCloudinaryMediaUrl(record);
  if (!deliveryUrl) return doc;

  return {
    ...doc,
    url: deliveryUrl,
  };
};

export function getCloudinaryAdminThumbnail(
  doc: CloudinaryMediaDoc,
): string | false | null {
  return resolveCloudinaryAdminThumbnail(doc) ?? false;
}
