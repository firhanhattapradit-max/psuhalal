import * as React from 'react';

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = '', ...props }, ref) => (
  <label
    ref={ref}
    className={`text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };