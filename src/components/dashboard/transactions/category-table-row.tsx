import { ArchiveIcon, ArchiveRestoreIcon, PencilIcon } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { CategoryIconAvatar } from "@/components/dashboard/category-icon-avatar"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import { m } from "@/paraglide/messages"
import { cn } from "@/lib/utils"

export type CategoryTableRowData = {
  _id: Id<"categories">
  name: string
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
      {isColumnVisible("status") && (
        <TableCell>
          <span className={cn(category.archived && "text-muted-foreground")}>
            {category.archived
              ? m.common_archived_status()
              : m.common_active_status()}
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
                label: m.common_edit(),
                icon: PencilIcon,
                onSelect: () => onEdit(category),
              },
              {
                id: "toggle-archived",
                label: category.archived
                  ? m.common_restore()
                  : m.common_archive(),
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
