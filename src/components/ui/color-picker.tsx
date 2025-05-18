import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export function ColorPicker({
  value,
  onChange,
  className,
  disabled = false
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Common color presets
  const presets = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#8800ff",
    "#88ff00", "#0088ff", "#ff0088", "#00ff88", "#8888ff",
    "#ff8888", "#88ff88", "#cccccc", "#666666", "#333333"
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded border"
              style={{ backgroundColor: value || '#ffffff' }}
            />
            <span>{value || "Pick a color"}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          <Input
            type="color"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
            }}
            className="h-12 w-full cursor-pointer"
          />
          
          <div className="grid grid-cols-5 gap-2">
            {presets.map((color) => (
              <button
                key={color}
                className="h-8 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color)
                  setOpen(false)
                }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          
          <Input
            type="text"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value
              if (/^#[0-9A-F]{6}$/i.test(newValue) || newValue === "") {
                onChange(newValue)
              }
            }}
            placeholder="#000000"
            className="font-mono"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}