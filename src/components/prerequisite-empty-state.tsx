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

export function PrerequisiteEmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaTo,
}: {
  icon: ReactNode
  title: string
  description: string
  ctaLabel: string
  ctaTo: string
}) {
  return (
    <Empty className="border-border/60 bg-card/70">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to={ctaTo} search={(previous) => previous}>
            {ctaLabel}
            <ArrowRightIcon />
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
