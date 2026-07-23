import type { AnchorHTMLAttributes, ReactNode } from 'react';

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

export function ExternalLink({
  children,
  href,
  target = '_blank',
  rel,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel ?? 'noopener noreferrer'}
      {...props}
    >
      {children}
    </a>
  );
}
