import * as React from "react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Type } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

// List of available monospace fonts (system fonts + imported Google Fonts)
const MONOSPACE_FONTS = [
  { value: "monospace", label: "Default Monospace" },
  // System fonts
  { value: "Consolas, monospace", label: "Consolas" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Monaco, monospace", label: "Monaco" },
  // Google Fonts
  { value: "Source Code Pro, monospace", label: "Source Code Pro" },
  { value: "Fira Code, monospace", label: "Fira Code" },
  { value: "JetBrains Mono, monospace", label: "JetBrains Mono" },
  { value: "Ubuntu Mono, monospace", label: "Ubuntu Mono" },
  { value: "Roboto Mono, monospace", label: "Roboto Mono" },
  { value: "Space Mono, monospace", label: "Space Mono" },
  { value: "IBM Plex Mono, monospace", label: "IBM Plex Mono" },
  { value: "Inconsolata, monospace", label: "Inconsolata" },
  { value: "Anonymous Pro, monospace", label: "Anonymous Pro" },
  { value: "Oxygen Mono, monospace", label: "Oxygen Mono" },
  { value: "PT Mono, monospace", label: "PT Mono" },
];

interface FontSelectorProps {
  onFontChange?: (font: string) => void;
  compact?: boolean;
}

function FontSelectorBase({ onFontChange, compact = false }: FontSelectorProps) {
  // Use internal state for font value, initialized from CSS variable
  const [fontValue, setFontValue] = useState(() => {
    const cssFont = getComputedStyle(document.documentElement).getPropertyValue('--ag-font-family').trim();
    return cssFont || "monospace";
  });
  
  // Listen for CSS variable changes from outside
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          const newFont = getComputedStyle(document.documentElement).getPropertyValue('--ag-font-family').trim();
          if (newFont && newFont !== fontValue) {
            setFontValue(newFont);
          }
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [fontValue]);
  
  const handleValueChange = (value: string) => {
    setFontValue(value);
    if (onFontChange) {
      onFontChange(value);
    } else {
      // Set the CSS variable directly if no handler is provided
      document.documentElement.style.setProperty("--ag-font-family", value);
    }
  };

  const fontSelect = (
    <div className="flex items-center gap-2">
      {!compact && <span className="text-sm text-muted-foreground">Grid Font:</span>}
      <Select 
        value={fontValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className={cn(
          compact ? "w-[240px] h-9" : "w-[280px]",
          compact && "pl-2.5"
        )}>
          {compact && <Type className="h-4 w-4 mr-2 opacity-70" />}
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Monospace Fonts</SelectLabel>
            {MONOSPACE_FONTS.map((font) => (
              <SelectItem 
                key={font.value} 
                value={font.value}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            {fontSelect}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          Select Grid Font
        </TooltipContent>
      </Tooltip>
    );
  }

  return fontSelect;
}

export const FontSelector = React.memo(FontSelectorBase); 