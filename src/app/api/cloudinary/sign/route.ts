import { NextRequest, NextResponse } from "next/server";
import {
  isCloudinaryConfigured,
  type CloudinaryResourceType,
} from "@/lib/cloudinary/config";
import { createUploadSignature } from "@/lib/cloudinary/sign";

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
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server." },
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
    const payload = createUploadSignature({
      resourceType,
      folder: body.folder,
    });
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create upload signature.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
