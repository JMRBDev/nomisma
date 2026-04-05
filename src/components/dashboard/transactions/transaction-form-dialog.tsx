import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
  TransactionType,
} from "@/components/dashboard/transactions/transactions-shared"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import { Button } from "@/components/ui/button"
import { TransactionFormFields } from "@/components/dashboard/transactions/transaction-form-fields"
import { getCategoryOptions } from "@/components/dashboard/transactions/transactions-shared"

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
  const submitDisabled =
    accountOptions.length === 0 ||
    (needsCategory && categoryOptions.length === 0)

  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit transaction" : "Add transaction"}
      description="Keep amounts positive. The transaction type decides whether it adds money, spends money, or moves money between your accounts."
    >
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

        {needsCategory && categoryOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create at least one {values.type} category in Settings before saving
            this transaction.
          </p>
        ) : null}

        <DashboardFormActions
          pending={pending}
          formError={formError}
          disabled={submitDisabled}
          submitLabel={editing ? "Update transaction" : "Save transaction"}
          secondaryAction={
            editing ? (
              <Button type="button" variant="outline" onClick={onStartNew}>
                New transaction
              </Button>
            ) : null
          }
        />
      </form>
    </DashboardFormDialog>
  )
}
