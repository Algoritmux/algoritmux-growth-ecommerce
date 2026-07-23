import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  arrow?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  arrow = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} button--${size} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span>{loading ? 'Aguarde…' : children}</span>
      {arrow && !loading ? (
        <span className="button__arrow" aria-hidden="true">
          →
        </span>
      ) : null}
    </button>
  );
}
