import { useState } from "react"
import type {
  AccountFieldErrors,
  AccountFormValues,
} from "@/components/dashboard/accounts/accounts-shared"
import {
  DEFAULT_ACCOUNT_VALUES,
  buildAccountPayload,
  validateAccountValues,
} from "@/components/dashboard/accounts/accounts-shared"

export function useAccountCreator({
  onCreateAccount,
}: {
  onCreateAccount: (
    payload: ReturnType<typeof buildAccountPayload>
  ) => Promise<unknown>
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [values, setValues] = useState<AccountFormValues>(
    DEFAULT_ACCOUNT_VALUES
  )
  const [errors, setErrors] = useState<AccountFieldErrors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)

  const resetState = () => {
    setValues(DEFAULT_ACCOUNT_VALUES)
    setErrors({})
    setFormError("")
  }

  const openDialog = () => {
    resetState()
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      resetState()
    }
  }

  const handleValueChange = (
    name: keyof Omit<AccountFormValues, "includeInTotals">,
    value: string
  ) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
    setErrors({})
    setFormError("")
  }

  const handleIncludeInTotalsChange = (checked: boolean) => {
    setValues((current) => ({
      ...current,
      includeInTotals: checked,
    }))
    setFormError("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateAccountValues(values)
    setErrors(nextErrors)
    setFormError("")

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setPending(true)

    try {
      await onCreateAccount(buildAccountPayload(values))
      setDialogOpen(false)
      resetState()
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the account."
      )
    } finally {
      setPending(false)
    }
  }

  return {
    dialogOpen,
    values,
    errors,
    formError,
    pending,
    openDialog,
    handleDialogOpenChange,
    handleValueChange,
    handleIncludeInTotalsChange,
    handleSubmit,
  }
}
