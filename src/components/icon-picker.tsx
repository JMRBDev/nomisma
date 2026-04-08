import type { LucideIcon } from "lucide-react"
import {
  DEFAULT_CUSTOM_COLOR,
  getPickerButtonClassName,
  isHexColor,
} from "@/components/picker-shared"
import { getContrastColor } from "@/lib/colors"
import { cn } from "@/lib/utils"

export type IconOption = {
  name: string
  label: string
  icon: LucideIcon
}

export function IconPicker({
  value,
  onChange,
  icons,
  colorValue,
  entityName,
}: {
  value: string
  onChange: (value: string) => void
  icons: Array<IconOption>
  colorValue: string
  entityName: string
}) {
  const customColorValue = isHexColor(colorValue)
    ? colorValue
    : DEFAULT_CUSTOM_COLOR
  const customColorSelected = customColorValue === colorValue
  const iconColor = getContrastColor(customColorValue)

  return (
    <div className="flex flex-wrap gap-2">
      {icons.map((option) => {
        const Icon = option.icon
        const selected = value === option.name

        return (
          <button
            key={option.name}
            type="button"
            onClick={() => onChange(option.name)}
            className={cn(
              getPickerButtonClassName(selected),
              selected && !customColorSelected && colorValue,
              selected && !customColorSelected && colorValue && "text-white",
              !selected && "text-muted-foreground"
            )}
            style={
              selected && customColorSelected
                ? { backgroundColor: customColorValue, color: iconColor }
                : undefined
            }
            aria-label={`Select ${option.label} ${entityName} icon`}
            title={option.label}
          >
            <Icon size={16} />
          </button>
        )
      })}
    </div>
  )
}
