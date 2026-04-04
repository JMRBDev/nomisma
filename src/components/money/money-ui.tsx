import { ArrowRightIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1">
          <h1 className="font-heading text-3xl leading-tight font-medium md:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string
}) {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl md:text-3xl">{value}</CardTitle>
      </CardHeader>
      {note ? (
        <CardContent>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {note}
          </p>
        </CardContent>
      ) : null}
    </Card>
  )
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

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
