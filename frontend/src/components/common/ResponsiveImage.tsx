import type {
  ImgHTMLAttributes,
  SourceHTMLAttributes,
} from 'react';

type ResponsiveImageSource = Pick<
  SourceHTMLAttributes<HTMLSourceElement>,
  'media' | 'sizes' | 'srcSet' | 'type'
>;

type ResponsiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  aspectRatio?: string;
  priority?: boolean;
  sources?: ResponsiveImageSource[];
};

export function ResponsiveImage({
  src,
  alt,
  aspectRatio,
  priority = false,
  sources = [],
  className = '',
  style,
  ...props
}: ResponsiveImageProps) {
  const image = (
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

  if (sources.length === 0) {
    return image;
  }

  return (
    <picture className="responsive-picture">
      {sources.map((source) => (
        <source
          key={`${source.type ?? ''}-${source.media ?? ''}-${source.srcSet}`}
          {...source}
        />
      ))}
      {image}
    </picture>
  );
}
