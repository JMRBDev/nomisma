import { PencilIcon, Trash2Icon } from "lucide-react"
import type { TransactionRecord } from "@/components/money/transactions-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function TransactionsTable({
  transactions,
  currency,
  onEdit,
  onDelete,
}: {
  transactions: Array<TransactionRecord>
  currency?: string | null
  onEdit: (transaction: TransactionRecord) => void
  onDelete: (transactionId: TransactionRecord["_id"]) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction._id}>
            <TableCell>{formatDateLabel(transaction.date)}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium">{transaction.description}</p>
                {transaction.note ? (
                  <p className="text-xs text-muted-foreground">
                    {transaction.note}
                  </p>
                ) : null}
              </div>
            </TableCell>
            <TableCell>
              {transaction.accountName}
              {transaction.toAccountName
                ? ` → ${transaction.toAccountName}`
                : ""}
            </TableCell>
            <TableCell>{transaction.categoryName ?? "Transfer"}</TableCell>
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
              className={`text-right font-medium ${getTransactionTone(transaction.type)}`}
            >
              {formatSignedAmount(
                transaction.amount,
                currency,
                transaction.type
              )}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onEdit(transaction)}
                  aria-label="Edit transaction"
                >
                  <PencilIcon />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onDelete(transaction._id)}
                  aria-label="Delete transaction"
                >
                  <Trash2Icon />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
