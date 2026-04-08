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
  allAccountOptions,
  categoryOptions,
  allCategoryOptions,
  onValueChange,
  onTypeChange,
  onAccountChange,
  onCreateAccount,
  onUnarchiveAccount,
  onCreateCategory,
  onUnarchiveCategory,
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
  allAccountOptions: Array<AccountOption>
  categoryOptions: Array<CategoryOption>
  allCategoryOptions: Array<CategoryOption>
  onValueChange: (name: keyof TransactionFormValues, value: string) => void
  onTypeChange: (value: TransactionType) => void
  onAccountChange: (value: string) => void
  onCreateAccount: (
    name: string,
    fieldName: "accountId" | "toAccountId"
  ) => void
  onUnarchiveAccount: (
    accountId: string,
    fieldName: "accountId" | "toAccountId"
  ) => void
  onCreateCategory: (name: string) => void
  onUnarchiveCategory: (categoryId: string) => void
}) {
  const resolvedCategoryOptions = getCategoryOptions(values.type, categoryOptions)

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
          allAccountOptions={allAccountOptions}
          categoryOptions={categoryOptions}
          allCategoryOptions={allCategoryOptions}
          onValueChange={onValueChange}
          onTypeChange={onTypeChange}
          onAccountChange={onAccountChange}
          onCreateAccount={onCreateAccount}
          onUnarchiveAccount={onUnarchiveAccount}
          onCreateCategory={onCreateCategory}
          onUnarchiveCategory={onUnarchiveCategory}
        />

        {values.type !== "transfer" && resolvedCategoryOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You can create a category directly from the category field if you
            need a new one.
          </p>
        ) : null}

        <DashboardFormActions
          pending={pending}
          formError={formError}
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
