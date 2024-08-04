import * as React from "react";
import { cn } from "~/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'edit';
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full text-sm transition-colors duration-200 ease-in-out",
          "text-gray-700 dark:text-gray-200",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variant === 'default' && "h-12 px-4 py-2 rounded-full bg-gray-50 dark:bg-dark-bg border border-amber-300 dark:border-amber-700",
          variant === 'edit' && "h-8 px-0 py-0 bg-transparent border-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };