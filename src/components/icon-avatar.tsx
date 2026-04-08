import type { LucideIcon } from "lucide-react"
import { getContrastColor } from "@/lib/colors"
import { cn } from "@/lib/utils"

export function IconAvatar({
  icon,
  color,
  iconMap,
}: {
  icon?: string | null
  color?: string | null
  iconMap: Record<string, LucideIcon>
}) {
  const resolvedColor = color?.trim()
  const isHex = resolvedColor?.startsWith("#")
  const iconColor = isHex
    ? getContrastColor(resolvedColor as string)
    : "#ffffff"
  const IconComponent = icon ? iconMap[icon] : null

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border p-1.5",
        !isHex && resolvedColor
      )}
      style={isHex ? { backgroundColor: resolvedColor } : undefined}
    >
      {IconComponent ? (
        <IconComponent
          size={14}
          style={{
            color: iconColor,
          }}
        />
      ) : null}
    </span>
  )
}
