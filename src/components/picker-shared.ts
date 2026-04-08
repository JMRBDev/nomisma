import { cn } from "@/lib/utils"

export const COLOR_OPTIONS = [
  { label: "Amber", value: "bg-amber-600" },
  { label: "Lime", value: "bg-lime-600" },
  { label: "Emerald", value: "bg-emerald-600" },
  { label: "Sky", value: "bg-sky-600" },
  { label: "Violet", value: "bg-violet-600" },
  { label: "Pink", value: "bg-pink-600" },
] as const

export const DEFAULT_CUSTOM_COLOR = "#94a3b8"

export function isHexColor(value: string) {
  return /^#[\da-fA-F]{6}$/.test(value.trim())
}

export function getPickerButtonClassName(selected: boolean) {
  return cn(
    "relative flex size-9 items-center justify-center rounded-full border transition-colors",
    selected
      ? "border-ring shadow-sm ring-4 ring-ring/30"
      : "border-border bg-background hover:border-foreground/15 hover:bg-accent/40"
  )
}
