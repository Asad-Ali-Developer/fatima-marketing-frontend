"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react"; // or use Material Symbols if preferred

import { cn } from "@/lib/utils";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        className={cn(
          "bg-slate-100" +
            "focus:ring-0 rounded-lg focus:border-[#00B7E8] transition-all duration-300 " +
            "px-0 py-3 w-full text-gray-900 placeholder-gray-400 " +
            "outline-[#00B7E8] pr-10", // extra padding on right for the icon
          className
        )}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none cursor-pointer"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOffIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
