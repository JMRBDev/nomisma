import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"
import type { SortState } from "@/hooks/use-data-table"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function DataTableHead({
  column,
  sort,
  onSort,
  className,
  children,
}: {
  column: string
  sort: SortState
  onSort: (column: string) => void
  className?: string
  children: React.ReactNode
}) {
  const isActive = sort?.column === column
  const isRight =
    typeof className === "string" && className.includes("text-right")

  return (
    <TableHead
      className={cn("group/sort cursor-pointer select-none", className)}
      onClick={() => onSort(column)}
    >
      <div
        className={cn("flex items-center gap-1", isRight && "justify-end")}
      >
        {children}
        <span
          className={cn(
            "shrink-0 transition-opacity",
            isActive
              ? "opacity-100"
              : "opacity-0 group-hover/sort:opacity-40"
          )}
        >
          {isActive && sort!.direction === "asc" ? (
            <ArrowUpIcon className="size-3" />
          ) : isActive && sort!.direction === "desc" ? (
            <ArrowDownIcon className="size-3" />
          ) : (
            <ArrowUpDownIcon className="size-3" />
          )}
        </span>
      </div>
    </TableHead>
  )
}
