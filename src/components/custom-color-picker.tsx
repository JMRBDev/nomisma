import { PencilIcon } from "lucide-react"
import { getContrastColor } from "@/lib/colors"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  isCustom?: boolean
}

export const CustomColorPicker = ({
  value,
  onChange,
  isCustom,
}: ColorPickerProps) => {
  return (
    <div className="relative size-8">
      <div
        className={cn(
          "pointer-events-none flex aspect-square size-8 items-center justify-center rounded-full border",
          {
            "ring-offset-0.5 ring-2 ring-ring": isCustom,
          }
        )}
        style={{
          backgroundColor: value,
        }}
      >
        <PencilIcon
          size={14}
          className="opacity-80"
          style={{
            color: getContrastColor(value),
          }}
        />
      </div>

      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => onChange((e.target as HTMLInputElement).value)}
        className="absolute inset-0 size-full opacity-0"
        aria-label="Select custom color"
      />
    </div>
  )
}
