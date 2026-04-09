import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CheckIcon,
  PencilIcon,
  XIcon,
} from "lucide-react"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { getAccountTypeLabel } from "@/components/dashboard/accounts/accounts-shared"
import { AccountIconAvatar } from "@/components/dashboard/account-icon-avatar"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/money"
import { m } from "@/paraglide/messages"

export function AccountsTableRow({
  account,
  currency,
  archived,
  pendingAccountId,
  isColumnVisible,
  onEdit,
  onToggleArchived,
}: {
  account: AccountRecord
  currency?: string | null
  archived: boolean
  pendingAccountId?: AccountRecord["_id"] | null
  isColumnVisible: (columnId: string) => boolean
  onEdit: (account: AccountRecord) => void
  onToggleArchived: (
    accountId: AccountRecord["_id"],
    archived: boolean
  ) => void | Promise<void>
}) {
  return (
    <TableRow>
      {isColumnVisible("name") && (
        <TableCell>
          <div className="flex items-center gap-3">
            <AccountIconAvatar icon={account.icon} color={account.color} />
            <span className="font-medium">{account.name}</span>
          </div>
        </TableCell>
      )}
      {isColumnVisible("type") && (
        <TableCell>{getAccountTypeLabel(account.type)}</TableCell>
      )}
      {isColumnVisible("includeInTotals") && (
        <TableCell className="text-center">
          {archived ? (
            <XIcon size={16} className="mx-auto text-muted-foreground" />
          ) : account.includeInTotals ? (
            <CheckIcon size={16} className="mx-auto text-success" />
          ) : (
            <XIcon size={16} className="mx-auto text-muted-foreground" />
          )}
        </TableCell>
      )}
      {isColumnVisible("currentBalance") && (
        <TableCell className="text-right font-medium">
          {formatCurrency(account.currentBalance, currency)}
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
                onSelect: () => onEdit(account),
              },
              {
                id: "toggle-archived",
                label: archived ? m.common_restore() : m.common_archive(),
                icon: archived ? ArchiveRestoreIcon : ArchiveIcon,
                disabled: pendingAccountId === account._id,
                onSelect: () => onToggleArchived(account._id, !archived),
              },
            ]}
          />
        </TableCell>
      )}
    </TableRow>
  )
}
