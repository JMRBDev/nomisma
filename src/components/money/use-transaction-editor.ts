import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
  TransactionRecord,
} from "@/components/money/transactions-shared"
import {
  buildTransactionPayload,
  createTransactionDefaults,
  createTransactionFormValues,
  getCategoryOptions,
  resolveValidOption,
  validateTransactionValues,
} from "@/components/money/transactions-shared"

export function useTransactionEditor({
  accountOptions,
  incomeCategoryOptions,
  expenseCategoryOptions,
}: {
  accountOptions: Array<AccountOption>
  incomeCategoryOptions: Array<CategoryOption>
  expenseCategoryOptions: Array<CategoryOption>
}) {
  const createTransaction = useConvexMutation(
    api.transactions.createTransaction
  )
  const updateTransaction = useConvexMutation(
    api.transactions.updateTransaction
  )
  const deleteTransactionMutation = useConvexMutation(
    api.transactions.deleteTransaction
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransactionId, setEditingTransactionId] =
    useState<Id<"transactions"> | null>(null)
  const [values, setValues] = useState(() =>
    createTransactionDefaults(accountOptions, expenseCategoryOptions)
  )
  const [errors, setErrors] = useState<TransactionFieldErrors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)

  const resetState = () => {
    setValues(createTransactionDefaults(accountOptions, expenseCategoryOptions))
    setErrors({})
    setFormError("")
  }

  const openCreateDialog = () => {
    setEditingTransactionId(null)
    resetState()
    setDialogOpen(true)
  }

  const openEditDialog = (transaction: TransactionRecord) => {
    setEditingTransactionId(transaction._id)
    setValues(createTransactionFormValues(transaction))
    setErrors({})
    setFormError("")
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      setEditingTransactionId(null)
      resetState()
    }
  }

  const handleValueChange = (
    name: keyof TransactionFormValues,
    value: string
  ) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
    setErrors({})
    setFormError("")
  }

  const handleTypeChange = (type: TransactionFormValues["type"]) => {
    setValues((current) => {
      const nextCategoryOptions = getCategoryOptions(
        type,
        incomeCategoryOptions,
        expenseCategoryOptions
      )

      return {
        ...current,
        type,
        toAccountId: "",
        categoryId:
          type === "transfer"
            ? ""
            : resolveValidOption(current.categoryId, nextCategoryOptions),
      }
    })
    setErrors({})
    setFormError("")
  }

  const handleAccountChange = (accountId: string) => {
    setValues((current) => ({
      ...current,
      accountId,
      toAccountId: current.toAccountId === accountId ? "" : current.toAccountId,
    }))
    setErrors({})
    setFormError("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateTransactionValues(values, {
      accountOptions,
      incomeCategoryOptions,
      expenseCategoryOptions,
    })

    setErrors(nextErrors)
    setFormError("")

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setPending(true)

    try {
      const payload = buildTransactionPayload(values, {
        accountOptions,
        incomeCategoryOptions,
        expenseCategoryOptions,
      })

      if (editingTransactionId) {
        await updateTransaction({
          transactionId: editingTransactionId,
          ...payload,
        })
      } else {
        await createTransaction(payload)
      }

      setEditingTransactionId(null)
      setDialogOpen(false)
      resetState()
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the transaction."
      )
    } finally {
      setPending(false)
    }
  }

  const deleteTransaction = (transactionId: TransactionRecord["_id"]) => {
    void deleteTransactionMutation({ transactionId })
  }

  return {
    dialogOpen,
    values,
    errors,
    formError,
    pending,
    isEditing: editingTransactionId !== null,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    handleValueChange,
    handleTypeChange,
    handleAccountChange,
    handleSubmit,
    deleteTransaction,
  }
}
