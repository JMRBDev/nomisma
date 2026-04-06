import { FileQuestionIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
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
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you're looking for doesn't exist or has been moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/dashboard">Go to Overview</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
