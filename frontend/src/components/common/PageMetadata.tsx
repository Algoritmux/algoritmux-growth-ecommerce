import { useEffect } from 'react';

type PageMetadataProps = {
  title: string;
  description: string;
};

export function PageMetadata({ title, description }: PageMetadataProps) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.append(meta);
    }
    meta.content = description;
  }, [description, title]);

  return null;
}
