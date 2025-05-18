import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FORM_LAYOUT } from "../style-utils";

interface FormRowProps {
  children: ReactNode;
  className?: string;
  cols?: number;
  alignBottom?: boolean;
}

/**
 * FormRow component for horizontally aligning form fields
 * Ensures all controls are aligned properly along their bottom edges
 */
export function FormRow({
  children,
  className,
  cols = 0,
  alignBottom = true
}: FormRowProps) {
  // Choose the appropriate layout based on provided cols
  let layoutClass = FORM_LAYOUT.row;
  if (cols === 2) layoutClass = FORM_LAYOUT.grid2;
  if (cols === 3) layoutClass = FORM_LAYOUT.grid3;
  
  const alignment = alignBottom ? "items-end" : "items-center";
  
  // For flex layouts, add alignment
  if (cols === 0) {
    return (
      <div className={cn(layoutClass, alignment, className)}>
        {children}
      </div>
    );
  }
  
  // For grid layouts
  return (
    <div className={cn(layoutClass, className)}>
      {children}
    </div>
  );
} 