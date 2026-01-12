// components/ui/checkbox.tsx

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
      "h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-700",
      "flex items-center justify-center",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0",

      // Unchecked state — explicitly define background
      "bg-white dark:bg-gray-800",

      // Checked state
      "data-[state=checked]:bg-primary data-[state=checked]:border-primary",

      // Hover state (both checked and unchecked)
      "hover:bg-gray-50 data-[state=checked]:bg-yellow-400 dark:hover:bg-gray-700",
      "data-[state=checked]:hover:bg-yellow-400", // lighter yellow on hover when checked

      // Active/click state
      "active:scale-95",

      // Ensure indicator is visible even if parent has weird styles
      "relative",

      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        // Force the checkmark to be black always
        "text-charcoal",
        // Hide indicator when unchecked
        "data-[state=unchecked]:hidden"
      )}
    >
      <CheckIcon className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = "Checkbox";

export { Checkbox };
