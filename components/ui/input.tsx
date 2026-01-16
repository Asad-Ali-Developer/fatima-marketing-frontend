// components/ui/input.tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "bg-transparent p-3 border-0 border-b-2 border-gray-200 " +
          "focus:ring-0 focus:border-[#00B7E8] transition-all duration-300 " +
          "px-0 py-3 w-full text-gray-900 placeholder-gray-400 " +
          "outline-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
