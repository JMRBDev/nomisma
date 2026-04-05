import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconOption {
  name: string
  icon: LucideIcon
}

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  icons: Array<IconOption>
}

export function IconPicker({ value, onChange, icons }: IconPickerProps) {
  return (
    <div className="flex items-center gap-2">
      {icons.map((option) => (
        <button
          key={option.name}
          type="button"
          onClick={() => onChange(option.name)}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border",
            {
              "ring-offset-0.5 ring-2 ring-ring": value === option.name,
            }
          )}
          aria-label={`Select ${option.name} icon`}
        >
          <option.icon size={16} />
        </button>
      ))}
    </div>
  )
}
