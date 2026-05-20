"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, Video } from "lucide-react";
import type { CloudinaryResourceType } from "@/lib/cloudinary/config";
import { uploadMediaToCloudinary } from "@/lib/cloudinary/upload-client";
import type { CloudinaryUploadResult } from "@/lib/cloudinary/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_IMAGE_MB = 15;
const DEFAULT_MAX_VIDEO_MB = 200;

const ACCEPT: Record<CloudinaryResourceType, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/webm,video/quicktime",
  auto: "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime",
};

export type MediaUploaderProps = {
  /** 上传类型：产品高清图 / 机器视频 */
  resourceType: CloudinaryResourceType;
  /** 可选自定义 Cloudinary 目录 */
  folder?: string;
  /** 与 Vercel 环境变量 UPLOAD_AUTH_SECRET 一致 */
  authToken?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  onUploadComplete?: (result: CloudinaryUploadResult) => void;
  onUploadError?: (error: Error) => void;
};

export function MediaUploader({
  resourceType,
  folder,
  authToken,
  multiple = false,
  maxSizeMB,
  disabled = false,
  className,
  onUploadComplete,
  onUploadError,
}: MediaUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<CloudinaryUploadResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const isUploading = progress !== null;

  const maxBytes =
    (maxSizeMB ??
      (resourceType === "video" ? DEFAULT_MAX_VIDEO_MB : DEFAULT_MAX_IMAGE_MB)) *
    1024 *
    1024;

  const label =
    resourceType === "video"
      ? "上传机器视频"
      : resourceType === "image"
        ? "上传产品高清图"
        : "上传图片或视频";

  const Icon = resourceType === "video" ? Video : ImageIcon;

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.size > maxBytes) {
        throw new Error(
          `文件过大（最大 ${Math.round(maxBytes / 1024 / 1024)} MB）。`,
        );
      }

      setError(null);
      setProgress(0);

      const result = await uploadMediaToCloudinary({
        file,
        resourceType,
        folder,
        authToken,
        onProgress: setProgress,
      });

      setLastResult(result);
      onUploadComplete?.(result);
    },
    [
      authToken,
      folder,
      maxBytes,
      onUploadComplete,
      resourceType,
    ],
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || disabled || isUploading) return;

      const list = multiple ? Array.from(files) : [files[0]];

      try {
        for (const file of list) {
          await uploadFile(file);
        }
      } catch (err) {
        const uploadError =
          err instanceof Error ? err : new Error("Upload failed.");
        setError(uploadError.message);
        onUploadError?.(uploadError);
      } finally {
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [disabled, isUploading, multiple, onUploadError, uploadFile],
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-muted/20 p-6",
        className,
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT[resourceType]}
        multiple={multiple}
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          {isUploading ? (
            <Loader2 className="size-6 animate-spin" aria-hidden />
          ) : (
            <Icon className="size-6" aria-hidden />
          )}
        </div>

        <div>
          <p className="font-medium text-primary">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {resourceType === "video"
              ? "支持 MP4、WebM、MOV，直传 Cloudinary"
              : "支持 JPEG、PNG、WebP、AVIF，直传 Cloudinary"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" aria-hidden />
          {isUploading ? `上传中 ${progress}%` : "选择文件"}
        </Button>

        {isUploading ? (
          <div
            className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progress ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {lastResult ? (
          <div className="w-full max-w-lg rounded-lg border bg-background p-3 text-left text-sm">
            <p className="font-medium text-primary">上传成功</p>
            <p className="mt-2 break-all text-muted-foreground">
              {lastResult.secureUrl}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              public_id: {lastResult.publicId}
              {lastResult.duration
                ? ` · ${lastResult.duration.toFixed(1)}s`
                : null}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
