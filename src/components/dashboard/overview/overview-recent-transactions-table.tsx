import type { OverviewRecentTransactionRecord } from "@/components/dashboard/overview/overview-shared"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatDateLabel,
  formatSignedAmount,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

export function OverviewRecentTransactionsTable({
  transactions,
  currency,
}: {
  transactions: Array<OverviewRecentTransactionRecord>
  currency?: string | null
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction._id}>
            <TableCell>{formatDateLabel(transaction.date)}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.categoryName ?? "Transfer"}
                </p>
              </div>
            </TableCell>
            <TableCell>
              {transaction.accountName}
              {transaction.toAccountName
                ? ` → ${transaction.toAccountName}`
                : ""}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Badge variant="outline">{transaction.type}</Badge>
                <Badge
                  variant={
                    transaction.status === "posted" ? "default" : "outline"
                  }
                >
                  {transaction.status}
                </Badge>
              </div>
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-medium",
                getTransactionTone(transaction.type)
              )}
            >
              {formatSignedAmount(
                transaction.amount,
                currency,
                transaction.type
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
