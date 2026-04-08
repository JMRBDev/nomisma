import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
  TransactionType,
} from "@/components/dashboard/transactions/transactions-shared"

export type TransactionReferenceFieldHandlers = {
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
}

export type TransactionFormFieldsProps = {
  values: TransactionFormValues
  errors: TransactionFieldErrors
  accountOptions: Array<AccountOption>
  allAccountOptions: Array<AccountOption>
  categoryOptions: Array<CategoryOption>
  allCategoryOptions: Array<CategoryOption>
  onValueChange: (name: keyof TransactionFormValues, value: string) => void
  onTypeChange: (value: TransactionType) => void
  onAccountChange: (value: string) => void
} & TransactionReferenceFieldHandlers
