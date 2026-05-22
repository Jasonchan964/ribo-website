import { NextRequest, NextResponse } from "next/server";
import {
  isCloudinaryClientUploadReady,
  type CloudinaryResourceType,
} from "@/lib/cloudinary/config";
import { createClientUploadParams } from "@/lib/cloudinary/upload-params.server";

export const runtime = "nodejs";

type SignRequestBody = {
  resourceType?: CloudinaryResourceType;
  folder?: string;
};

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.UPLOAD_AUTH_SECRET?.trim();
  if (!secret) return true;

  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!isCloudinaryClientUploadReady()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary client upload is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (unsigned) or signing credentials.",
      },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SignRequestBody = {};
  try {
    body = (await request.json()) as SignRequestBody;
  } catch {
    body = {};
  }

  const resourceType = body.resourceType ?? "image";
  if (!["image", "video", "auto"].includes(resourceType)) {
    return NextResponse.json(
      { error: "Invalid resourceType. Use image, video, or auto." },
      { status: 400 },
    );
  }

  try {
    const payload = createClientUploadParams({
      resourceType,
      folder: body.folder,
    });
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create Cloudinary upload parameters.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
