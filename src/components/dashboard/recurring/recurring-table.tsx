import { useMemo } from "react"
import { PencilIcon, PowerIcon, PowerOffIcon } from "lucide-react"
import type { RecurringRecord } from "@/components/dashboard/recurring/recurring-shared"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import {
  canConfirmRecurringItem,
  getRecurringStatusLabel,
} from "@/components/dashboard/recurring/recurring-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTableHead } from "@/components/ui/data-table-head"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import {
  formatCurrency,
  formatDateLabel,
  formatSignedAmount,
  getRecurringTone,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

const RECURRING_SORT_ACCESSORS: Record<
  string,
  (row: RecurringRecord) => string | number
> = {
  nextDueDate: (row) => row.nextDueDate,
  description: (row) => row.description.toLowerCase(),
  accountName: (row) => row.accountName.toLowerCase(),
  categoryName: (row) => row.categoryName.toLowerCase(),
  frequency: (row) => row.frequency,
  status: (row) => row.status,
  amount: (row) => {
    if (row.type === "income") return row.amount
    return -row.amount
  },
}

export function RecurringTable({
  recurringItems,
  currency,
  pendingRuleId,
  today,
  onConfirm,
  onEdit,
  onToggle,
}: {
  recurringItems: Array<RecurringRecord>
  currency?: string | null
  pendingRuleId: RecurringRecord["_id"] | null
  today: string
  onConfirm: (ruleId: RecurringRecord["_id"]) => void
  onEdit: (rule: RecurringRecord) => void
  onToggle: (ruleId: RecurringRecord["_id"], active: boolean) => void
}) {
  const table = useDataTable({
    data: recurringItems,
    sortAccessors: RECURRING_SORT_ACCESSORS,
    defaultSort: { column: "nextDueDate", direction: "asc" },
  })

  const aggregates = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    for (const item of table.allSortedData) {
      if (item.type === "income") totalIncome += item.amount
      else totalExpense += item.amount
    }
    return { totalIncome, totalExpense, net: totalIncome - totalExpense }
  }, [table.allSortedData])

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <DataTableHead
              column="nextDueDate"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Next due
            </DataTableHead>
            <DataTableHead
              column="description"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Description
            </DataTableHead>
            <DataTableHead
              column="accountName"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Account
            </DataTableHead>
            <DataTableHead
              column="categoryName"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Category
            </DataTableHead>
            <DataTableHead
              column="frequency"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Schedule
            </DataTableHead>
            <DataTableHead
              column="status"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Status
            </DataTableHead>
            <DataTableHead
              column="amount"
              sort={table.sort}
              onSort={table.toggleSort}
              className="text-right"
            >
              Amount
            </DataTableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.data.map((item) => {
            const canConfirm = canConfirmRecurringItem(item, today)
            const pending = pendingRuleId === item._id

            return (
              <TableRow key={item._id}>
                <TableCell>
                  <p
                    className={cn("font-medium", getRecurringTone(item.status))}
                  >
                    {formatDateLabel(item.nextDueDate)}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Starts {formatDateLabel(item.startDate)}
                      {item.endDate
                        ? ` • Ends ${formatDateLabel(item.endDate)}`
                        : ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{item.accountName}</TableCell>
                <TableCell>{item.categoryName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.frequency}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "overdue" ? "destructive" : "outline"
                    }
                    className={cn(
                      item.status !== "overdue" && getRecurringTone(item.status)
                    )}
                  >
                    {getRecurringStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium",
                    getTransactionTone(item.type)
                  )}
                >
                  {formatSignedAmount(item.amount, currency, item.type)}
                </TableCell>
                <TableCell>
                  <DashboardTableActions>
                    <DashboardIconButton
                      onClick={() => onEdit(item)}
                      aria-label="Edit recurring item"
                    >
                      <PencilIcon />
                    </DashboardIconButton>
                    <DashboardIconButton
                      onClick={() => onToggle(item._id, !item.active)}
                      aria-label={
                        item.active
                          ? "Deactivate recurring item"
                          : "Activate recurring item"
                      }
                    >
                      {item.active ? <PowerOffIcon /> : <PowerIcon />}
                    </DashboardIconButton>
                    {canConfirm ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onConfirm(item._id)}
                        disabled={pending}
                      >
                        {pending ? "Saving..." : "Confirm"}
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Due later
                      </span>
                    )}
                  </DashboardTableActions>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        {table.allSortedData.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>
                <span className="text-muted-foreground">
                  Income:{" "}
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(aggregates.totalIncome, currency)}
                  </span>
                  {" · "}Expense:{" "}
                  <span className="font-medium text-rose-300">
                    {formatCurrency(aggregates.totalExpense, currency)}
                  </span>
                  {" · "}Net:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      aggregates.net >= 0 ? "text-emerald-400" : "text-rose-300"
                    )}
                  >
                    {formatCurrency(aggregates.net, currency)}
                  </span>
                </span>
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        )}
      </Table>

      <DataTablePagination
        page={table.page}
        pageSize={table.pageSize}
        pageSizeOptions={table.pageSizeOptions}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
      />
    </div>
  )
}
