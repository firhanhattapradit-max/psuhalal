import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'gold';
}

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200',
    outline: 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300',
    gold: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-extrabold transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export { Badge };