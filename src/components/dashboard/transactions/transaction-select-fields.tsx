import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
} from "@/components/dashboard/transactions/transactions-shared"
import { resolveValidOption } from "@/components/dashboard/transactions/transactions-shared"
import { ReferenceComboboxField } from "@/components/dashboard/reference-combobox-field"
import { getCreateOrRestoreActions } from "@/lib/reference-entities"

export function TransactionSelectFields({
  values,
  errors,
  accountOptions,
  allAccountOptions,
  categoryOptions,
  allCategoryOptions,
  onValueChange,
  onAccountChange,
  onCreateAccount,
  onUnarchiveAccount,
  onCreateCategory,
  onUnarchiveCategory,
}: {
  values: TransactionFormValues
  errors: TransactionFieldErrors
  accountOptions: Array<AccountOption>
  allAccountOptions: Array<AccountOption>
  categoryOptions: Array<CategoryOption>
  allCategoryOptions: Array<CategoryOption>
  onValueChange: (name: keyof TransactionFormValues, value: string) => void
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
  const getAccountActions = (query: string, fieldName: "accountId" | "toAccountId") => {
    return getCreateOrRestoreActions({
      options: allAccountOptions,
      query,
      createKey: `create-account-${fieldName}`,
      unarchiveKey: `unarchive-account-${fieldName}`,
      createDescription: "Finish account setup and select it here.",
      unarchiveDescription: "Restore this account and select it here.",
      onCreate: (name) => onCreateAccount(name, fieldName),
      onUnarchive: (account) => onUnarchiveAccount(account._id, fieldName),
    })
  }

  const categoryReferenceOptions = allCategoryOptions.filter(
    (category) => category.kind === values.type
  )

  const getCategoryActions = (query: string) => {
    return getCreateOrRestoreActions({
      options: categoryReferenceOptions,
      query,
      createKey: "create-category",
      unarchiveKey: "unarchive-category",
      createDescription: "Finish category setup and use it for this transaction.",
      unarchiveDescription: "Restore this category and use it here.",
      onCreate: onCreateCategory,
      onUnarchive: (category) => onUnarchiveCategory(category._id),
    })
  }

  const destinationAccountOptions = accountOptions.filter(
    (account) => account._id !== values.accountId
  )

  return (
    <>
      <ReferenceComboboxField
        id="transaction-account"
        label={values.type === "transfer" ? "From account" : "Account"}
        value={resolveValidOption(values.accountId, accountOptions)}
        options={accountOptions.map((account) => ({
          value: account._id,
          label: account.name,
        }))}
        error={errors.accountId}
        placeholder="Search or create an account"
        emptyMessage="No accounts found."
        onValueChange={onAccountChange}
        getActions={(query) => getAccountActions(query, "accountId")}
      />

      {values.type === "transfer" ? (
        <ReferenceComboboxField
          id="transaction-to-account"
          label="Destination account"
          value={values.toAccountId}
          options={destinationAccountOptions.map((account) => ({
            value: account._id,
            label: account.name,
          }))}
          error={errors.toAccountId}
          placeholder="Search or create an account"
          emptyMessage="No destination accounts found."
          onValueChange={(nextValue) => onValueChange("toAccountId", nextValue)}
          getActions={(query) => getAccountActions(query, "toAccountId")}
        />
      ) : (
        <ReferenceComboboxField
          id="transaction-category"
          label="Category"
          value={resolveValidOption(values.categoryId, categoryOptions)}
          options={categoryOptions.map((category) => ({
            value: category._id,
            label: category.name,
          }))}
          error={errors.categoryId}
          placeholder={`Search or create a ${values.type} category`}
          emptyMessage={`No ${values.type} categories found.`}
          onValueChange={(nextValue) => onValueChange("categoryId", nextValue)}
          getActions={getCategoryActions}
        />
      )}
    </>
  )
}
