import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentFont } from '../contexts/current-font-context'; // UPDATED IMPORT

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
}

export function FontSelector({ onFontChange }: FontSelectorProps) {
  console.log("🔤 FontSelector rendering");
  const { currentGridFont } = useCurrentFont();
  console.log("🔤 Current font from context:", currentGridFont);
  
  const handleValueChange = (value: string) => {
    console.log("🔤 Font value changed to:", value);
    if (onFontChange) {
      console.log("🔤 Calling onFontChange with:", value);
      onFontChange(value);
    } else {
      console.log("🔤 No onFontChange handler provided");
    }
  };

  React.useEffect(() => {
    console.log("🔤 FontSelector mounted with current font:", currentGridFont);
  }, []); // Note: currentGridFont is not in dep array, so this only logs initial mount value

  React.useEffect(() => {
    console.log("🔤 Current font changed to:", currentGridFont);
  }, [currentGridFont]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Grid Font:</span>
      <Select 
        value={currentGridFont}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-[180px]">
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
} 