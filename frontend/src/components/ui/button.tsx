import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gold';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md',
      outline: 'border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
      secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
      link: 'text-emerald-600 underline-offset-4 hover:underline p-0 h-auto',
      gold: 'bg-amber-500 text-white hover:bg-amber-600 shadow-md',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 px-3 text-xs rounded-lg',
      lg: 'h-12 px-6 text-base rounded-xl',
      icon: 'h-10 w-10 p-0 rounded-full justify-center',
    };

    return (
      <button
        className={`inline-flex items-center justify-center font-bold rounded-xl transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95 ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };