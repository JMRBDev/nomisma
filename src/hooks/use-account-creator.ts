import type {
  AccountFieldErrors,
  AccountFormValues,
} from "@/components/dashboard/accounts/accounts-shared"
import {
  DEFAULT_ACCOUNT_VALUES,
  buildAccountPayload,
  validateAccountValues,
} from "@/components/dashboard/accounts/accounts-shared"
import { useFormDialog } from "@/hooks/use-form-dialog"

export function useAccountCreator({
  onCreateAccount,
}: {
  onCreateAccount: (
    payload: ReturnType<typeof buildAccountPayload>
  ) => Promise<unknown>
}) {
  const dialog = useFormDialog<AccountFormValues, AccountFieldErrors>({
    createDefaults: () => DEFAULT_ACCOUNT_VALUES,
    validate: validateAccountValues,
    onSubmit: async (values) => {
      await onCreateAccount(buildAccountPayload(values))
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
    openDialog: dialog.openCreateDialog,
    handleIncludeInTotalsChange,
  }
}
