import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string;
}

export function Card({ padding = 16, style, className, children, ...rest }: CardProps) {
  return (
    <div
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={{ padding, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
