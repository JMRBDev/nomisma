import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type User = {
  email?: string | null
  image?: string | null
  name?: string | null
}

interface Props {
  user?: User
}

export function UserInfoPreview({ user }: Props) {
  const fallback = user?.name?.[0]?.toUpperCase() ?? "?"

  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user?.name}</span>
        <span className="truncate text-xs text-sidebar-foreground/60">
          {user?.email}
        </span>
      </div>
    </>
  )
}
