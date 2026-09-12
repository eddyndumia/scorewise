import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'social';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  iconLeft,
  iconRight,
  children,
  className,
  ...rest
}: ButtonProps) {
  const variantClass = styles[variant];
  return (
    <button className={[styles.button, variantClass, className].filter(Boolean).join(' ')} {...rest}>
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className={[styles.icon, styles.iconRight].join(' ')}>{iconRight}</span>}
    </button>
  );
}
