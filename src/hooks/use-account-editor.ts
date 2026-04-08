import type {
  AccountFieldErrors,
  AccountFormValues,
  AccountRecord,
} from "@/components/dashboard/accounts/accounts-shared"
import {
  buildAccountPayload,
  createDefaultAccountValues,
  validateAccountValues,
} from "@/components/dashboard/accounts/accounts-shared"
import { useFormDialog } from "@/hooks/use-form-dialog"

export function useAccountEditor({
  onUpdateAccount,
  createFormValues,
}: {
  onUpdateAccount: (
    accountId: AccountRecord["_id"],
    payload: ReturnType<typeof buildAccountPayload>
  ) => Promise<unknown>
  createFormValues: (account: AccountRecord) => AccountFormValues
}) {
  const dialog = useFormDialog<
    AccountFormValues,
    AccountFieldErrors,
    AccountRecord
  >({
    createDefaults: createDefaultAccountValues,
    createFormValues,
    validate: validateAccountValues,
    onSubmit: async (values) => {
      const entity = dialog.editingEntity
      if (entity) {
        await onUpdateAccount(entity._id, buildAccountPayload(values))
      }
    },
    onValueChange: (name, value, { setValues, setErrors, setFormError }) => {
      setValues((current) => ({
        ...current,
        [name]: value,
      }))
      setErrors({})
      setFormError("")
    },
  })

  const handleIncludeInTotalsChange = (checked: boolean) => {
    dialog.setValues((current) => ({
      ...current,
      includeInTotals: checked,
    }))
    dialog.setFormError("")
  }

  return {
    ...dialog,
    handleIncludeInTotalsChange,
  }
}
