import { ArchiveIcon, ArchiveRestoreIcon, PencilIcon } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { CategoryIconAvatar } from "@/components/dashboard/category-icon-avatar"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type CategoryTableRowData = {
  _id: Id<"categories">
  name: string
  kind: "income" | "expense"
  color?: string | null
  icon?: string | null
  archived: boolean
  transactionCount: number
}

export function CategoryTableRow({
  category,
  isColumnVisible,
  onEdit,
  onToggleArchived,
}: {
  category: CategoryTableRowData
  isColumnVisible: (columnId: string) => boolean
  onEdit: (category: CategoryTableRowData) => void
  onToggleArchived: (categoryId: Id<"categories">, archived: boolean) => void
}) {
  return (
    <TableRow>
      {isColumnVisible("name") && (
        <TableCell>
          <div className="flex items-center gap-3">
            <CategoryIconAvatar icon={category.icon} color={category.color} />
            <span className="font-medium">{category.name}</span>
          </div>
        </TableCell>
      )}
      {isColumnVisible("kind") && (
        <TableCell>
          <span
            className={cn(
              category.kind === "income" ? "text-success" : "text-destructive"
            )}
          >
            {category.kind === "income" ? "Income" : "Expense"}
          </span>
        </TableCell>
      )}
      {isColumnVisible("status") && (
        <TableCell>
          <span className={cn(category.archived && "text-muted-foreground")}>
            {category.archived ? "Archived" : "Active"}
          </span>
        </TableCell>
      )}
      {isColumnVisible("transactionCount") && (
        <TableCell className="text-right">
          {category.transactionCount}
        </TableCell>
      )}
      {isColumnVisible("actions") && (
        <TableCell>
          <DashboardTableActions
            actions={[
              {
                id: "edit",
                label: "Edit",
                icon: PencilIcon,
                onSelect: () => onEdit(category),
              },
              {
                id: "toggle-archived",
                label: category.archived ? "Restore" : "Archive",
                icon: category.archived ? ArchiveRestoreIcon : ArchiveIcon,
                onSelect: () =>
                  onToggleArchived(category._id, !category.archived),
              },
            ]}
          />
        </TableCell>
      )}
    </TableRow>
  )
}
