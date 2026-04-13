import { useMemo } from "react"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import type {
  TransactionFilterValues,
  TransactionRecord,
} from "@/components/dashboard/transactions/transactions-shared"
import { filterTransactions } from "@/components/dashboard/transactions/transactions-shared"

const transactionsRouteApi = getRouteApi(
  "/_authenticated/dashboard/transactions"
)

export function useTransactionSearchFilter(args: {
  dateRange: {
    endDate?: string
    startDate?: string
  }
  filters: TransactionFilterValues
  hasDateFilter: boolean
  transactions: Array<TransactionRecord>
}) {
  const navigate = useNavigate()
  const { transactionId } = transactionsRouteApi.useSearch()

  const filteredTransactions = useMemo(
    () =>
      filterTransactions(
        args.transactions.filter((transaction) => {
          if (transactionId && transaction._id !== transactionId) return false
          if (
            args.dateRange.startDate &&
            transaction.date < args.dateRange.startDate
          )
            return false
          if (
            args.dateRange.endDate &&
            transaction.date > args.dateRange.endDate
          )
            return false
          return true
        }),
        args.filters
      ),
    [
      args.dateRange.endDate,
      args.dateRange.startDate,
      args.filters,
      args.transactions,
      transactionId,
    ]
  )

  const clearSearchFilters = () => {
    if (!args.hasDateFilter && !transactionId) return

    void navigate({
      to: ".",
      search: (previous) => ({
        ...previous,
        from: undefined,
        to: undefined,
        transactionId: undefined,
      }),
    })
  }

  return {
    clearSearchFilters,
    filteredTransactions,
    hasSearchFilters: args.hasDateFilter || !!transactionId,
  }
}
