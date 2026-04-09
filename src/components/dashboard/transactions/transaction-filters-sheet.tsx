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
import { m } from "@/paraglide/messages"
import {
  getTransactionStatusOptions,
  getTransactionTypeOptions,
} from "@/lib/money"

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
  const transactionStatusOptions = getTransactionStatusOptions()
  const transactionTypeOptions = getTransactionTypeOptions()

  return (
    <DashboardFilterSheet
      open={open}
      onOpenChange={onOpenChange}
      description={m.transactions_filter_description()}
      footer={
        <DashboardFilterSummary
          icon={FunnelIcon}
          action={
            activeFilterCount > 0 ? (
              <Button size="sm" variant="ghost" onClick={onReset}>
                {m.common_clear_all()}
              </Button>
            ) : null
          }
        >
          <span>{m.transactions_matching_count({ count: matchCount })}</span>
        </DashboardFilterSummary>
      }
    >
      <div className="grid gap-4">
        <DashboardFilterSelectField
          id="mobile-filter-type"
          label={m.common_type()}
          value={values.type}
          onChange={(value) => onChange("type", value)}
        >
          <NativeSelectOption value="all">
            {m.transactions_all_types()}
          </NativeSelectOption>
          {transactionTypeOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </DashboardFilterSelectField>

        <DashboardFilterSelectField
          id="mobile-filter-status"
          label={m.common_status()}
          value={values.status}
          onChange={(value) => onChange("status", value)}
        >
          <NativeSelectOption value="all">
            {m.transactions_all_statuses()}
          </NativeSelectOption>
          {transactionStatusOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </DashboardFilterSelectField>

        <DashboardFilterSelectField
          id="mobile-filter-account"
          label={m.common_account()}
          value={values.accountId}
          onChange={(value) => onChange("accountId", value)}
        >
          <NativeSelectOption value="all">
            {m.transactions_all_accounts()}
          </NativeSelectOption>
          {accountOptions.map((account) => (
            <NativeSelectOption key={account._id} value={account._id}>
              {account.name}
            </NativeSelectOption>
          ))}
        </DashboardFilterSelectField>

        <DashboardFilterSelectField
          id="mobile-filter-category"
          label={m.common_category()}
          value={values.categoryId}
          onChange={(value) => onChange("categoryId", value)}
        >
          <NativeSelectOption value="all">
            {m.transactions_all_categories()}
          </NativeSelectOption>
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
