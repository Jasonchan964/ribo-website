import Image, { type ImageProps } from "next/image";

export type OptimizedImageProps = ImageProps & {
  /** 首屏关键图设为 true，其余默认懒加载 */
  priority?: boolean;
};

/**
 * next/image 封装：非 priority 图片默认 lazy loading，利于 Core Web Vitals。
 */
export function OptimizedImage({
  priority = false,
  loading,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      priority={priority}
      loading={priority ? undefined : (loading ?? "lazy")}
      {...props}
    />
  );
}
