import { ACCOUNT_ICON_MAP } from "@/components/dashboard/accounts/accounts-shared"
import { getContrastColor } from "@/lib/colors"
import { cn } from "@/lib/utils"

export function AccountIconAvatar({
  icon,
  color,
}: {
  icon?: string | null
  color?: string | null
}) {
  const resolvedColor = color?.trim()
  const isHex = resolvedColor?.startsWith("#")
  const iconColor = isHex
    ? getContrastColor(resolvedColor as string)
    : "#ffffff"
  const IconComponent = icon ? ACCOUNT_ICON_MAP[icon] : null

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
