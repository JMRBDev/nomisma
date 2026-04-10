import { FileQuestionIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { m } from "@/lib/i18n-client"
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

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center p-8">
      <Empty>
        <EmptyHeader>
          <p className="font-heading text-sm tracking-tight text-muted-foreground">
            {APP_NAME}
          </p>
          <EmptyMedia variant="icon">
            <FileQuestionIcon />
          </EmptyMedia>
          <EmptyTitle>{m.not_found_title()}</EmptyTitle>
          <EmptyDescription>{m.not_found_description()}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/dashboard">{m.error_go_to_overview()}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
