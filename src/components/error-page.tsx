import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { ErrorComponentProps } from "@tanstack/react-router"
import { m } from "@/paraglide/messages"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { APP_NAME } from "@/lib/money"

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center p-8">
      <Empty>
        <EmptyHeader>
          <p className="font-heading text-sm tracking-tight text-muted-foreground">
            {APP_NAME}
          </p>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon />
          </EmptyMedia>
          <EmptyTitle>{m.error_title()}</EmptyTitle>
          <EmptyDescription>{m.error_description()}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => reset()}>
              <RefreshCwIcon />
              {m.error_reload()}
            </Button>
            <Button asChild>
              <Link to="/dashboard">{m.error_go_to_overview()}</Link>
            </Button>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-destructive">
              {error.stack ?? error.message}
            </pre>
          )}
        </EmptyContent>
      </Empty>
    </div>
  )
}
