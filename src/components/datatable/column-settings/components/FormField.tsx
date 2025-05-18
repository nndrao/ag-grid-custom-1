import React, { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { FORM_LAYOUT } from "../style-utils";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
  inline?: boolean;
  fullWidth?: boolean;
}

/**
 * FormField component that provides consistent layout and alignment for form controls
 * Ensures that form controls are properly aligned horizontally with their bottom edges
 */
export function FormField({
  label,
  htmlFor,
  className,
  children,
  inline = false,
  fullWidth = true
}: FormFieldProps) {
  if (inline) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Label 
          htmlFor={htmlFor} 
          className="text-xs whitespace-nowrap flex-shrink-0 min-w-24"
        >
          {label}
        </Label>
        <div className={cn("flex-1", fullWidth && "w-full")}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(FORM_LAYOUT.field, className)}>
      <Label 
        htmlFor={htmlFor} 
        className={FORM_LAYOUT.label}
      >
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
} 