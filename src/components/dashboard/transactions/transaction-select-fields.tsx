import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
} from "@/components/dashboard/transactions/transactions-shared"
import { resolveValidOption } from "@/components/dashboard/transactions/transactions-shared"
import { ReferenceComboboxField } from "@/components/dashboard/reference-combobox-field"
import { getCreateOrRestoreActions } from "@/lib/reference-entities"
import { t } from "@/lib/i18n"

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
  const getAccountActions = (
    query: string,
    fieldName: "accountId" | "toAccountId"
  ) => {
    return getCreateOrRestoreActions({
      options: allAccountOptions,
      query,
      createKey: `create-account-${fieldName}`,
      unarchiveKey: `unarchive-account-${fieldName}`,
      createDescription: t("transactions_account_reference_description"),
      unarchiveDescription: t("transactions_account_restore_description"),
      onCreate: (name) => onCreateAccount(name, fieldName),
      onUnarchive: (account) => onUnarchiveAccount(account._id, fieldName),
    })
  }

  const getCategoryActions = (query: string) => {
    return getCreateOrRestoreActions({
      options: allCategoryOptions,
      query,
      createKey: "create-category",
      unarchiveKey: "unarchive-category",
      createDescription: t("transactions_category_reference_description"),
      unarchiveDescription: t("transactions_category_restore_description"),
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
        label={
          values.type === "transfer"
            ? t("transactions_from_account")
            : t("common_account")
        }
        value={resolveValidOption(values.accountId, accountOptions)}
        options={accountOptions.map((account) => ({
          value: account._id,
          label: account.name,
        }))}
        error={errors.accountId}
        placeholder={t("transactions_search_account_placeholder")}
        emptyMessage={t("transactions_no_accounts_found")}
        onValueChange={onAccountChange}
        getActions={(query) => getAccountActions(query, "accountId")}
      />

      {values.type === "transfer" ? (
        <ReferenceComboboxField
          id="transaction-to-account"
          label={t("transactions_destination_account")}
          value={values.toAccountId}
          options={destinationAccountOptions.map((account) => ({
            value: account._id,
            label: account.name,
          }))}
          error={errors.toAccountId}
          placeholder={t("transactions_search_account_placeholder")}
          emptyMessage={t("transactions_no_destination_accounts_found")}
          onValueChange={(nextValue) => onValueChange("toAccountId", nextValue)}
          getActions={(query) => getAccountActions(query, "toAccountId")}
        />
      ) : (
        <ReferenceComboboxField
          id="transaction-category"
          label={t("common_category")}
          value={resolveValidOption(values.categoryId, categoryOptions)}
          options={categoryOptions.map((category) => ({
            value: category._id,
            label: category.name,
          }))}
          error={errors.categoryId}
          placeholder={t("transactions_search_category_placeholder")}
          emptyMessage={t("transactions_no_categories_found")}
          onValueChange={(nextValue) => onValueChange("categoryId", nextValue)}
          getActions={getCategoryActions}
        />
      )}
    </>
  )
}
