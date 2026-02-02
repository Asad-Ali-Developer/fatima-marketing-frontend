"use client";

import * as React from "react";
import { Input, InputProps } from "@/components/ui/input"; // Adjust path as needed
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<InputProps, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Remove non-digit characters
      inputValue = inputValue.replace(/\D/g, "");

      // Enforce max length of 11
      if (inputValue.length > 11) {
        inputValue = inputValue.slice(0, 11);
      }

      // Auto-prepend "03" if empty or invalid start
      if (inputValue.length === 1 && inputValue !== "0") {
        inputValue = "0" + inputValue;
      }
      if (inputValue.length === 2 && !inputValue.startsWith("03")) {
        inputValue = "03";
      }

      onChange(inputValue);
    };

    const formatPhoneNumber = (val: string) => {
      if (!val) return "";
      // Only allow digits, ensure it starts with 03, and is up to 11 digits
      const digits = val.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 2) return digits;
      if (digits.length <= 11)
        return `${digits.slice(0, 2)}${digits.slice(2)}`;
      return digits;
    };

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={formatPhoneNumber(value)}
        onChange={handleChange}
        className={cn(
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
          className,
        )}
        placeholder="03XXXXXXX"
        {...props}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
