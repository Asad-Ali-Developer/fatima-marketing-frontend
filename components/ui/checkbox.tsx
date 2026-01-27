"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles
      "h-4 w-4 rounded border-2 border-gray-300",
      "flex items-center justify-center",
      "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0",

      // Unchecked state — explicitly define background
      "bg-white",

      // Checked state
      "data-[state=checked]:bg-white data-[state=checked]:border-white/60",

      // Hover state (both checked and unchecked)
      "hover:bg-gray-50 data-[state=checked]:bg-[#00B7E8]",
      "data-[state=checked]:hover:bg-[#00B7E8]", // lighter yellow on hover when checked

      // Active/click state
      "active:scale-95",

      // Ensure indicator is visible even if parent has weird styles
      "relative",

      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        // Force the checkmark to be black always
        "text-charcoal",
        // Hide indicator when unchecked
        "data-[state=unchecked]:hidden",
      )}
    >
      <CheckIcon className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = "Checkbox";

export { Checkbox };
