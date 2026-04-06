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
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/money"

export function AccountsTableRow({
  account,
  currency,
  archived,
  pendingAccountId,
  onEdit,
  onToggleArchived,
}: {
  account: AccountRecord
  currency?: string | null
  archived: boolean
  pendingAccountId?: AccountRecord["_id"] | null
  onEdit: (account: AccountRecord) => void
  onToggleArchived: (
    accountId: AccountRecord["_id"],
    archived: boolean
  ) => void | Promise<void>
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <AccountIconAvatar icon={account.icon} color={account.color} />
          <span className="font-medium">{account.name}</span>
        </div>
      </TableCell>
      <TableCell>{getAccountTypeLabel(account.type)}</TableCell>
      <TableCell className="text-center">
        {archived ? (
          <XIcon size={16} className="mx-auto text-muted-foreground" />
        ) : account.includeInTotals ? (
          <CheckIcon size={16} className="mx-auto text-emerald-400" />
        ) : (
          <XIcon size={16} className="mx-auto text-muted-foreground" />
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(account.currentBalance, currency)}
      </TableCell>
      <TableCell>
        <DashboardTableActions>
          <DashboardIconButton
            onClick={() => onEdit(account)}
            aria-label="Edit account"
          >
            <PencilIcon />
          </DashboardIconButton>
          <DashboardIconButton
            onClick={() => onToggleArchived(account._id, !archived)}
            disabled={pendingAccountId === account._id}
            aria-label={archived ? "Restore account" : "Archive account"}
          >
            {archived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
          </DashboardIconButton>
        </DashboardTableActions>
      </TableCell>
    </TableRow>
  )
}
