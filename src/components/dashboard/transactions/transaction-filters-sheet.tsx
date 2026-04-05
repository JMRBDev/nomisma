import { FunnelIcon } from "lucide-react"
import type {
  AccountOption,
  CategoryOption,
  TransactionFilterValues,
} from "@/components/dashboard/transactions/transactions-shared"
import { DashboardFilterSelectField } from "@/components/dashboard/dashboard-filter-select-field"
import { DashboardFilterSheet } from "@/components/dashboard/dashboard-filter-sheet"
import { DashboardFilterSummary } from "@/components/dashboard/dashboard-filter-summary"
import { Button } from "@/components/ui/button"
import { NativeSelectOption } from "@/components/ui/native-select"
import { transactionStatusOptions, transactionTypeOptions } from "@/lib/money"

export function TransactionFiltersSheet({
  open,
  onOpenChange,
  values,
  onChange,
  onReset,
  activeFilterCount,
  matchCount,
  accountOptions,
  categoryOptions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: TransactionFilterValues
  onChange: (name: keyof TransactionFilterValues, value: string) => void
  onReset: () => void
  activeFilterCount: number
  matchCount: number
  accountOptions: Array<AccountOption>
  categoryOptions: Array<CategoryOption>
}) {
  return (
    <DashboardFilterSheet
      open={open}
      onOpenChange={onOpenChange}
      description="Refine the transaction list without leaving the dashboard."
      footer={
        <DashboardFilterSummary
          icon={FunnelIcon}
          action={
            activeFilterCount > 0 ? (
              <Button size="sm" variant="ghost" onClick={onReset}>
                Clear all
              </Button>
            ) : null
          }
        >
          <span>{matchCount} matching transactions</span>
        </DashboardFilterSummary>
      }
    >
      <div className="grid gap-4">
        <DashboardFilterSelectField
          id="mobile-filter-type"
          label="Type"
          value={values.type}
          onChange={(value) => onChange("type", value)}
        >
          <NativeSelectOption value="all">All types</NativeSelectOption>
          {transactionTypeOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </DashboardFilterSelectField>

        <DashboardFilterSelectField
          id="mobile-filter-status"
          label="Status"
          value={values.status}
          onChange={(value) => onChange("status", value)}
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          {transactionStatusOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </DashboardFilterSelectField>

        <DashboardFilterSelectField
          id="mobile-filter-account"
          label="Account"
          value={values.accountId}
          onChange={(value) => onChange("accountId", value)}
        >
          <NativeSelectOption value="all">All accounts</NativeSelectOption>
          {accountOptions.map((account) => (
            <NativeSelectOption key={account._id} value={account._id}>
              {account.name}
            </NativeSelectOption>
          ))}
        </DashboardFilterSelectField>

        <DashboardFilterSelectField
          id="mobile-filter-category"
          label="Category"
          value={values.categoryId}
          onChange={(value) => onChange("categoryId", value)}
        >
          <NativeSelectOption value="all">All categories</NativeSelectOption>
          {categoryOptions.map((category) => (
            <NativeSelectOption key={category._id} value={category._id}>
              {category.name}
            </NativeSelectOption>
          ))}
        </DashboardFilterSelectField>
      </div>
    </DashboardFilterSheet>
  )
}
