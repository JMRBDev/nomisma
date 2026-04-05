import { ArrowRightIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function GuidedEmptyState({
  title,
  description,
  ctaLabel,
  ctaTo,
  icon,
  action,
}: {
  title: string
  description: string
  ctaLabel?: string
  ctaTo?: string
  icon: ReactNode
  action?: ReactNode
}) {
  return (
    <Empty className="border-border/60 bg-card/70">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {action ??
          (ctaLabel && ctaTo ? (
            <Button asChild>
              <Link to={ctaTo}>
                {ctaLabel}
                <ArrowRightIcon />
              </Link>
            </Button>
          ) : null)}
      </EmptyContent>
    </Empty>
  )
}
