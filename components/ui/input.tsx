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
        "p-3 border-0 bg-slate-100 rounded-md border-slate-50" +
          "focus:ring-0 focus:border-[#00B7E8] transition-all duration-300 " +
          "py-3 w-full text-gray-900 placeholder-gray-400 " +
          "outline-[#00B7E8]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
