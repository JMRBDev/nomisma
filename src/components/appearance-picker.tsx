import { PencilIcon } from "lucide-react"
import { Separator } from "./ui/separator"
import type { LucideIcon } from "lucide-react"
import type { IconOption } from "@/components/picker-shared"
import { IconAvatar } from "@/components/icon-avatar"
import {
  COLOR_OPTIONS,
  DEFAULT_CUSTOM_COLOR,
  getPickerButtonClassName,
  isHexColor,
} from "@/components/picker-shared"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getContrastColor } from "@/lib/colors"
import { cn } from "@/lib/utils"

export function AppearancePicker({
  colorValue,
  iconValue,
  onColorChange,
  onIconChange,
  icons,
  iconMap,
  entityName,
}: {
  colorValue: string
  iconValue: string
  onColorChange: (value: string) => void
  onIconChange: (value: string) => void
  icons: Array<IconOption>
  iconMap: Record<string, LucideIcon>
  entityName: string
}) {
  const customColorValue = isHexColor(colorValue)
    ? colorValue
    : DEFAULT_CUSTOM_COLOR
  const customColorSelected = customColorValue === colorValue

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-full focus-visible:ring-4 focus-visible:ring-ring/30"
          aria-label={`Choose ${entityName} appearance`}
        >
          <IconAvatar
            icon={iconValue}
            color={colorValue}
            iconMap={iconMap}
            className="size-8"
            iconSize={16}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="max-w-80">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onColorChange(option.value)}
                className={cn(
                  getPickerButtonClassName(colorValue === option.value),
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
                onChange={(event) => onColorChange(event.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label={`Select custom ${entityName} color`}
              />
            </label>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {icons.map((option) => {
              const Icon = option.icon
              const selected = iconValue === option.name

              return (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => onIconChange(option.name)}
                  className={cn(
                    getPickerButtonClassName(selected),
                    selected && !customColorSelected && colorValue,
                    selected &&
                      !customColorSelected &&
                      colorValue &&
                      "text-white",
                    !selected && "text-muted-foreground"
                  )}
                  aria-label={`Select ${option.label} ${entityName} icon`}
                  title={option.label}
                >
                  <Icon size={16} />
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
