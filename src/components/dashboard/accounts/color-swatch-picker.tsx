import { useState } from "react"
import { CustomColorPicker } from "@/components/custom-color-picker"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const COLORS = [
  { name: "amber", className: "bg-amber-600" },
  { name: "lime", className: "bg-lime-600" },
  { name: "emerald", className: "bg-emerald-600" },
  { name: "sky", className: "bg-sky-600" },
  { name: "violet", className: "bg-violet-600" },
  { name: "pink", className: "bg-pink-600" },
]

export function ColorSwatchPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [isCustomColor, setIsCustomColor] = useState<boolean>(false)
  const [customColorValue, setCustomColorValue] = useState<string>("#ffffff")

  return (
    <div className="flex items-center gap-2">
      {COLORS.map((color) => (
        <button
          key={color.name}
          type="button"
          onClick={() => {
            setIsCustomColor(false)
            onChange(color.className)
          }}
          className={cn(
            "aspect-square size-8 rounded-full border",
            color.className,
            {
              "ring-offset-0.5 ring-2 ring-ring":
                value === color.className && !isCustomColor,
            }
          )}
          aria-label={`Select ${color.name}`}
        />
      ))}

      <Separator orientation="vertical" />

      <CustomColorPicker
        onChange={(color) => {
          setIsCustomColor(true)
          setCustomColorValue(color)
          onChange(color)
        }}
        value={customColorValue}
        isCustom={isCustomColor}
      />
    </div>
  )
}
