import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { recurringFrequencyOptions, transactionTypeOptions } from "@/lib/money"

export function RecurringRuleDialog({
  open,
  onOpenChange,
  onSubmit,
  type,
  setType,
  amount,
  setAmount,
  activeAccounts,
  accountId,
  setAccountId,
  categoryOptions,
  categoryId,
  setCategoryId,
  description,
  setDescription,
  frequency,
  setFrequency,
  startDate,
  setStartDate,
  nextDueDate,
  setNextDueDate,
  endDate,
  setEndDate,
  error,
  pending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  type: "income" | "expense"
  setType: (value: "income" | "expense") => void
  amount: string
  setAmount: (value: string) => void
  activeAccounts: Array<{ _id: string; name: string }>
  accountId: string
  setAccountId: (value: string) => void
  categoryOptions: Array<{ _id: string; name: string }>
  categoryId: string
  setCategoryId: (value: string) => void
  description: string
  setDescription: (value: string) => void
  frequency: (typeof recurringFrequencyOptions)[number]["value"]
  setFrequency: (value: (typeof recurringFrequencyOptions)[number]["value"]) => void
  startDate: string
  setStartDate: (value: string) => void
  nextDueDate: string
  setNextDueDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void
  error: string
  pending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add recurring item</DialogTitle>
          <DialogDescription>
            Use this for money movements that repeat on a schedule and should
            show up ahead of time.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="recurring-type">
                  <FieldTitle>Type</FieldTitle>
                </FieldLabel>
                <NativeSelect
                  id="recurring-type"
                  value={type}
                  onChange={(event) => setType(event.target.value as typeof type)}
                >
                  {transactionTypeOptions
                    .filter((option) => option.value !== "transfer")
                    .map((option) => (
                      <NativeSelectOption key={option.value} value={option.value}>
                        {option.label}
                      </NativeSelectOption>
                    ))}
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel htmlFor="recurring-amount">
                  <FieldTitle>Amount</FieldTitle>
                </FieldLabel>
                <Input
                  id="recurring-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="recurring-account">
                <FieldTitle>Account</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="recurring-account"
                value={accountId || activeAccounts[0]?._id}
                onChange={(event) => setAccountId(event.target.value)}
              >
                {activeAccounts.map((account) => (
                  <NativeSelectOption key={account._id} value={account._id}>
                    {account.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="recurring-category">
                <FieldTitle>Category</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="recurring-category"
                value={categoryId || categoryOptions[0]?._id}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={categoryOptions.length === 0}
              >
                {categoryOptions.length === 0 ? (
                  <NativeSelectOption value="">Create a category first</NativeSelectOption>
                ) : null}
                {categoryOptions.map((category) => (
                  <NativeSelectOption key={category._id} value={category._id}>
                    {category.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="recurring-description">
                <FieldTitle>Description</FieldTitle>
              </FieldLabel>
              <Input
                id="recurring-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Rent"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="recurring-frequency">
                <FieldTitle>Frequency</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="recurring-frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as typeof frequency)}
              >
                {recurringFrequencyOptions.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="recurring-start-date">
                  <FieldTitle>Start date</FieldTitle>
                </FieldLabel>
                <Input
                  id="recurring-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="recurring-next-date">
                  <FieldTitle>Next due date</FieldTitle>
                </FieldLabel>
                <Input
                  id="recurring-next-date"
                  type="date"
                  value={nextDueDate}
                  onChange={(event) => setNextDueDate(event.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="recurring-end-date">
                <FieldTitle>End date</FieldTitle>
              </FieldLabel>
              <Input
                id="recurring-end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </Field>
          </FieldGroup>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {categoryOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Create at least one {type} category in Settings before saving this
              recurring item.
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={
              pending || activeAccounts.length === 0 || categoryOptions.length === 0
            }
            className="w-full"
          >
            {pending ? "Saving..." : "Save recurring item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
