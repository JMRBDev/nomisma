import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
  TransactionType,
} from "@/components/money/transactions-shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TransactionFormFields } from "@/components/money/transaction-form-fields"
import { getCategoryOptions } from "@/components/money/transactions-shared"

export function TransactionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  onStartNew,
  editing,
  values,
  errors,
  formError,
  pending,
  accountOptions,
  incomeCategoryOptions,
  expenseCategoryOptions,
  onValueChange,
  onTypeChange,
  onAccountChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onStartNew: () => void
  editing: boolean
  values: TransactionFormValues
  errors: TransactionFieldErrors
  formError: string
  pending: boolean
  accountOptions: Array<AccountOption>
  incomeCategoryOptions: Array<CategoryOption>
  expenseCategoryOptions: Array<CategoryOption>
  onValueChange: (name: keyof TransactionFormValues, value: string) => void
  onTypeChange: (value: TransactionType) => void
  onAccountChange: (value: string) => void
}) {
  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )
  const needsCategory = values.type !== "transfer"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit transaction" : "Add transaction"}
          </DialogTitle>
          <DialogDescription>
            Keep amounts positive. The transaction type decides whether it adds
            money, spends money, or moves money between your accounts.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <TransactionFormFields
            values={values}
            errors={errors}
            accountOptions={accountOptions}
            incomeCategoryOptions={incomeCategoryOptions}
            expenseCategoryOptions={expenseCategoryOptions}
            onValueChange={onValueChange}
            onTypeChange={onTypeChange}
            onAccountChange={onAccountChange}
          />

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}
          {needsCategory && categoryOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Create at least one {values.type} category in Settings before
              saving this transaction.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={
                pending ||
                accountOptions.length === 0 ||
                (needsCategory && categoryOptions.length === 0)
              }
              className="flex-1"
            >
              {pending
                ? "Saving..."
                : editing
                  ? "Update transaction"
                  : "Save transaction"}
            </Button>
            {editing ? (
              <Button type="button" variant="outline" onClick={onStartNew}>
                New transaction
              </Button>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
