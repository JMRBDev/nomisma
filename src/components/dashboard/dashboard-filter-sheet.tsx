import type { ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function DashboardFilterSheet({
  open,
  onOpenChange,
  title = "Filters",
  description,
  children,
  footer,
  contentClassName,
  bodyClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
  bodyClassName?: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("w-full sm:max-w-md", contentClassName)}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className={cn("space-y-5 px-6 pb-6", bodyClassName)}>
          {children}
          {footer}
        </div>
      </SheetContent>
    </Sheet>
  )
}
