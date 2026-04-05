import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../../convex/_generated/api"
import { TransactionsFeature } from "@/components/money/transactions-feature"
import { useTransactionsPageData } from "@/hooks/use-money-dashboard"

export function TransactionsPage() {
  const { data } = useTransactionsPageData()
  const createTransaction = useConvexMutation(api.transactions.createTransaction)
  const updateTransaction = useConvexMutation(api.transactions.updateTransaction)
  const deleteTransaction = useConvexMutation(api.transactions.deleteTransaction)

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  return (
    <TransactionsFeature
      data={data}
      actions={{
        onCreateTransaction: (payload) => createTransaction(payload),
        onUpdateTransaction: (transactionId, payload) =>
          updateTransaction({
            transactionId,
            ...payload,
          }),
        onDeleteTransaction: (transactionId) =>
          deleteTransaction({ transactionId }),
      }}
    />
  )
}
