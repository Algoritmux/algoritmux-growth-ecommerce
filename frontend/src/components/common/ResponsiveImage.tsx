import type { ImgHTMLAttributes } from 'react';

type ResponsiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  aspectRatio?: string;
  priority?: boolean;
};

export function ResponsiveImage({
  src,
  alt,
  aspectRatio,
  priority = false,
  className = '',
  style,
  ...props
}: ResponsiveImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`responsive-image ${className}`.trim()}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      style={{ aspectRatio, ...style }}
      {...props}
    />
  );
}
