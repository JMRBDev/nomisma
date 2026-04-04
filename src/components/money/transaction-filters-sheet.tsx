import { CalendarRangeIcon } from "lucide-react"
import type {
  AccountOption,
  CategoryOption,
  TransactionFilterValues,
} from "@/components/money/transactions-shared"
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine the transaction list without leaving the dashboard.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-6 pb-6">
          <div className="grid gap-4">
            <FilterSelectField
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
            </FilterSelectField>

            <FilterSelectField
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
            </FilterSelectField>

            <FilterSelectField
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
            </FilterSelectField>

            <FilterSelectField
              id="mobile-filter-category"
              label="Category"
              value={values.categoryId}
              onChange={(value) => onChange("categoryId", value)}
            >
              <NativeSelectOption value="all">
                All categories
              </NativeSelectOption>
              {categoryOptions.map((category) => (
                <NativeSelectOption key={category._id} value={category._id}>
                  {category.name}
                </NativeSelectOption>
              ))}
            </FilterSelectField>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="mobile-filter-from-date">
                  <FieldTitle>From</FieldTitle>
                </FieldLabel>
                <Input
                  id="mobile-filter-from-date"
                  type="date"
                  value={values.fromDate}
                  onChange={(event) => onChange("fromDate", event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="mobile-filter-to-date">
                  <FieldTitle>To</FieldTitle>
                </FieldLabel>
                <Input
                  id="mobile-filter-to-date"
                  type="date"
                  value={values.toDate}
                  onChange={(event) => onChange("toDate", event.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-background/60 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarRangeIcon className="size-4" />
              <span>{matchCount} matching transactions</span>
            </div>
            {activeFilterCount > 0 ? (
              <Button size="sm" variant="ghost" onClick={onReset}>
                Clear all
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function FilterSelectField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        <FieldTitle>{label}</FieldTitle>
      </FieldLabel>
      <NativeSelect
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </NativeSelect>
    </Field>
  )
}
