import { useRef, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import type {
  RecurringRecord,
  RecurringType,
} from "@/components/dashboard/recurring/recurring-shared"
import {
  buildRecurringPayload,
  createRecurringDefaults,
  createRecurringFormValues,
  validateRecurringValues,
} from "@/components/dashboard/recurring/recurring-payload"
import { useFormDialog } from "@/hooks/use-form-dialog"
import { resolveCategoryOnTypeChange } from "@/lib/form-helpers"

const recurringRouteApi = getRouteApi("/_authenticated/dashboard/recurring")

type RecurringData = ReturnType<typeof recurringRouteApi.useLoaderData>

export function useRecurringDialog(data: RecurringData | null | undefined) {
  const navigate = useNavigate()
  const createRecurringRule = useConvexMutation(
    api.recurring.createRecurringRule
  )
  const updateRecurringRule = useConvexMutation(
    api.recurring.updateRecurringRule
  )
  const toggleRecurringRule = useConvexMutation(
    api.recurring.toggleRecurringRule
  )
  const confirmRecurringRule = useConvexMutation(
    api.recurring.confirmRecurringRule
  )
  const editingRuleIdRef = useRef<Id<"recurringRules"> | null>(null)
  const [pendingRuleId, setPendingRuleId] = useState<
    RecurringRecord["_id"] | null
  >(null)

  const accountOptions = data?.accounts.active ?? []
  const incomeCategoryOptions = data?.categories.activeIncome ?? []
  const expenseCategoryOptions = data?.categories.activeExpense ?? []
  const editorOptions = {
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  }

  const dialog = useFormDialog({
    createDefaults: () =>
      createRecurringDefaults(
        accountOptions,
        incomeCategoryOptions,
        expenseCategoryOptions
      ),
    createFormValues: createRecurringFormValues,
    validate: (values) => validateRecurringValues(values, editorOptions),
    onSubmit: async (values) => {
      if (!data) return
      const payload = buildRecurringPayload(values, {
        accountOptions: data.accounts.active,
        incomeCategoryOptions: data.categories.activeIncome,
        expenseCategoryOptions: data.categories.activeExpense,
      })
      const editingId = editingRuleIdRef.current
      if (editingId)
        await updateRecurringRule({ ruleId: editingId, ...payload })
      else await createRecurringRule(payload)
    },
  })

  const handleClearDateFilter = () => {
    void navigate({
      to: ".",
      search: (previous) => ({ ...previous, from: undefined, to: undefined }),
    })
  }

  const handleTypeChange = (value: RecurringType) => {
    dialog.setValues((current) => ({
      ...current,
      type: value,
      categoryId: resolveCategoryOnTypeChange(
        current.categoryId,
        value,
        incomeCategoryOptions,
        expenseCategoryOptions
      ),
    }))
  }

  const handleConfirm = async (ruleId: RecurringRecord["_id"]) => {
    setPendingRuleId(ruleId)
    try {
      await confirmRecurringRule({ ruleId })
    } finally {
      setPendingRuleId(null)
    }
  }

  const handleEdit = (rule: RecurringRecord) => {
    editingRuleIdRef.current = rule._id
    dialog.openEditDialog(rule)
  }

  const handleToggle = async (
    ruleId: RecurringRecord["_id"],
    active: boolean
  ) => {
    await toggleRecurringRule({ ruleId, active })
  }

  const handleDialogClose = (open: boolean) => {
    dialog.handleDialogOpenChange(open)
    if (!open) editingRuleIdRef.current = null
  }

  return {
    dialog,
    pendingRuleId,
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
    handleClearDateFilter,
    handleTypeChange,
    handleConfirm,
    handleEdit,
    handleToggle,
    handleDialogClose,
  }
}
