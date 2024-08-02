import * as React from "react";

import { cn } from "~/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11.5 w-full rounded-md border px-4 py-2.5 text-base transition-colors duration-200 ease-in-out",
          "bg-amber-50 dark:bg-dark-bg",
          "text-gray-700 dark:text-gray-200",
          "border-amber-300 dark:border-amber-700",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400",
          "focus:border-amber-500 dark:focus:border-amber-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
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