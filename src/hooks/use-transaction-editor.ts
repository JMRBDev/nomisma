import { useRef } from "react"
import type { Id } from "../../convex/_generated/dataModel"
import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
  TransactionRecord,
  TransactionsPageActions,
} from "@/components/dashboard/transactions/transactions-shared"
import {
  buildTransactionPayload,
  createTransactionDefaults,
  createTransactionFormValues,
  validateTransactionValues,
} from "@/components/dashboard/transactions/transactions-shared"
import { resolveCategoryOnTypeChange } from "@/lib/form-helpers"
import { useFormDialog } from "@/hooks/use-form-dialog"

type TransactionEditorOptions = {
  accountOptions: Array<AccountOption>
  incomeCategoryOptions: Array<CategoryOption>
  expenseCategoryOptions: Array<CategoryOption>
} & TransactionsPageActions

export function useTransactionEditor({
  accountOptions,
  incomeCategoryOptions,
  expenseCategoryOptions,
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionEditorOptions) {
  const editingTransactionIdRef = useRef<Id<"transactions"> | null>(null)

  const optionsRef = useRef({
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  })
  optionsRef.current = {
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  }

  const dialog = useFormDialog<
    TransactionFormValues,
    TransactionFieldErrors,
    TransactionRecord
  >({
    createDefaults: () =>
      createTransactionDefaults(
        optionsRef.current.accountOptions,
        optionsRef.current.expenseCategoryOptions
      ),
    createFormValues: createTransactionFormValues,
    validate: (values) => validateTransactionValues(values, optionsRef.current),
    onSubmit: async (values) => {
      const payload = buildTransactionPayload(values, optionsRef.current)
      const editingId = editingTransactionIdRef.current
      if (editingId) {
        await onUpdateTransaction(editingId, payload)
      } else {
        await onCreateTransaction(payload)
      }
    },
    onValueChange: (name, value, { setValues, setErrors, setFormError }) => {
      if (name === "accountId") {
        setValues((current) => ({
          ...current,
          accountId: value,
          toAccountId: current.toAccountId === value ? "" : current.toAccountId,
        }))
        setErrors({})
        setFormError("")
        return
      }

      setValues((current) => ({ ...current, [name]: value }))
      setErrors({})
      setFormError("")
    },
    onDelete: async (entity) => {
      await onDeleteTransaction(entity._id)
    },
  })

  const handleTypeChange = (type: TransactionFormValues["type"]) => {
    dialog.setValues((current) => ({
      ...current,
      type,
      toAccountId: "",
      categoryId: resolveCategoryOnTypeChange(
        current.categoryId,
        type,
        incomeCategoryOptions,
        expenseCategoryOptions
      ),
    }))
    dialog.setErrors({})
    dialog.setFormError("")
  }

  const handleAccountChange = (accountId: string) => {
    dialog.setValues((current) => ({
      ...current,
      accountId,
      toAccountId: current.toAccountId === accountId ? "" : current.toAccountId,
    }))
    dialog.setErrors({})
    dialog.setFormError("")
  }

  const openEditDialog = (transaction: TransactionRecord) => {
    editingTransactionIdRef.current = transaction._id
    dialog.openEditDialog(transaction)
  }

  const handleDialogClose = (open: boolean) => {
    dialog.handleDialogOpenChange(open)
    if (!open) editingTransactionIdRef.current = null
  }

  return {
    ...dialog,
    openEditDialog,
    handleDialogOpenChange: handleDialogClose,
    handleTypeChange,
    handleAccountChange,
  }
}
