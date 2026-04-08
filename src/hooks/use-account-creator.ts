import type {
  AccountFieldErrors,
  AccountFormValues,
} from "@/components/dashboard/accounts/accounts-shared"
import {
  buildAccountPayload,
  createDefaultAccountValues,
  validateAccountValues,
} from "@/components/dashboard/accounts/accounts-shared"
import { useFormDialog } from "@/hooks/use-form-dialog"

export function useAccountCreator({
  onCreateAccount,
  onCreateSuccess,
}: {
  onCreateAccount: (
    payload: ReturnType<typeof buildAccountPayload>
  ) => Promise<unknown>
  onCreateSuccess?: (accountId: string) => Promise<unknown> | unknown
}) {
  const dialog = useFormDialog<AccountFormValues, AccountFieldErrors>({
    createDefaults: createDefaultAccountValues,
    validate: validateAccountValues,
    onSubmit: async (values) => {
      return onCreateAccount(buildAccountPayload(values))
    },
    onSubmitSuccess: async (result) => {
      if (typeof result === "string") {
        await onCreateSuccess?.(result)
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
    openDialog: dialog.openCreateDialog,
    handleIncludeInTotalsChange,
  }
}
