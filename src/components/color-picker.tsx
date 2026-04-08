import { PencilIcon } from "lucide-react"
import {
  COLOR_OPTIONS,
  DEFAULT_CUSTOM_COLOR,
  getPickerButtonClassName,
  isHexColor,
} from "@/components/picker-shared"
import { getContrastColor } from "@/lib/colors"
import { cn } from "@/lib/utils"

export function ColorPicker({
  value,
  onChange,
  entityName,
}: {
  value: string
  onChange: (value: string) => void
  entityName: string
}) {
  const customColorValue = isHexColor(value) ? value : DEFAULT_CUSTOM_COLOR
  const customColorSelected = customColorValue === value

  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            getPickerButtonClassName(value === option.value),
            option.value
          )}
          aria-label={`Select ${option.label} ${entityName} color`}
        />
      ))}

      <label className={getPickerButtonClassName(customColorSelected)}>
        <span
          className="flex size-full items-center justify-center rounded-full"
          style={{ backgroundColor: customColorValue }}
        >
          <PencilIcon
            size={14}
            className="opacity-85"
            style={{ color: getContrastColor(customColorValue) }}
          />
        </span>
        <input
          type="color"
          value={customColorValue}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={`Select custom ${entityName} color`}
        />
      </label>
    </div>
  )
}
