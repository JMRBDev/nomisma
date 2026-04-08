import type { useTransactionEditor } from "@/hooks/use-transaction-editor"
import { useAccountReferenceActions } from "@/hooks/use-account-reference-actions"
import { useCategoryReferenceActions } from "@/hooks/use-category-reference-actions"

export function useTransactionReferenceHandlers(
  transactionEditor: ReturnType<typeof useTransactionEditor>
) {
  const accountActions = useAccountReferenceActions()
  const categoryActions = useCategoryReferenceActions()

  const handleCreateAccount = (
    name: string,
    fieldName: "accountId" | "toAccountId"
  ) =>
    accountActions.handleCreateAccount(name, (accountId) => {
      if (fieldName === "accountId") {
        transactionEditor.handleAccountChange(accountId)
        return
      }

      transactionEditor.handleValueChange("toAccountId", accountId)
    })

  const handleUnarchiveAccount = (
    accountId: string,
    fieldName: "accountId" | "toAccountId"
  ) =>
    accountActions.handleUnarchiveAccount(accountId, (nextAccountId) => {
      if (fieldName === "accountId") {
        transactionEditor.handleAccountChange(nextAccountId)
        return
      }

      transactionEditor.handleValueChange("toAccountId", nextAccountId)
    })

  const handleCreateCategory = (name: string) =>
    categoryActions.handleCreateCategory(
      name,
      transactionEditor.values.type === "income" ? "income" : "expense",
      (categoryId) => transactionEditor.handleValueChange("categoryId", categoryId)
    )

  const handleUnarchiveCategory = (categoryId: string) =>
    categoryActions.handleUnarchiveCategory(categoryId, (nextCategoryId) =>
      transactionEditor.handleValueChange("categoryId", nextCategoryId)
    )

  return {
    accountActions,
    categoryActions,
    handleCreateAccount,
    handleUnarchiveAccount,
    handleCreateCategory,
    handleUnarchiveCategory,
  }
}
