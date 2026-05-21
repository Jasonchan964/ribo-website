import type { CollectionBeforeChangeHook } from "payload";
import {
  applyCloudinaryClientUploadToData,
  getCloudinaryClientUploadContext,
} from "@/lib/cloudinary/client-upload-doc";

export const cloudinaryClientUploadBeforeChange: CollectionBeforeChangeHook = ({
  data,
  req,
}) => {
  const ctx = getCloudinaryClientUploadContext(req);
  if (!ctx) return data;
  return applyCloudinaryClientUploadToData(data, ctx);
};
