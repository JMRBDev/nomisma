import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Separator } from "./separator"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

export function DataTablePagination({
  page,
  pageSize,
  pageSizeOptions,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  pageSizeOptions: Array<number>
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const pages = generatePages(page, totalPages)

  return (
    <div className="flex gap-2 pt-4 items-center justify-between">
      <Select
        value={String(pageSize)}
        onValueChange={(v) => onPageSizeChange(Number(v))}
      >
        <SelectTrigger
          size="sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {totalPages > 1 && (
        <>
          <Separator orientation="vertical" />
          <Pagination className="-ml-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  aria-label="Go to previous page"
                  size="icon-sm"
                  aria-disabled={page <= 1}
                  className={cn({
                    "pointer-events-none opacity-50": page <= 1
                  })}
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                </PaginationLink>
              </PaginationItem>

              {pages.map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      size="sm"
                      isActive={p === page}
                      onClick={() => onPageChange(p as number)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationLink
                  aria-label="Go to next page"
                  size="icon-sm"
                  aria-disabled={page >= totalPages}
                  className={cn({
                    "pointer-events-none opacity-50": page >= totalPages
                  })}
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                >
                  <ChevronRightIcon data-icon="inline-end" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  )
}

function generatePages(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: Array<number | "ellipsis"> = [1]

  if (current > 3) {
    pages.push("ellipsis")
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push("ellipsis")
  }

  pages.push(total)

  return pages
}


