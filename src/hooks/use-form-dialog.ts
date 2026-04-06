import { useRef, useState } from "react"

type FormDialogOptions<TValues, TFieldErrors, TEntity> = {
  createDefaults: () => TValues
  createFormValues?: (entity: TEntity) => TValues
  validate: (values: TValues) => TFieldErrors
  onSubmit: (values: TValues) => Promise<unknown>
  onValueChange?: (
    name: keyof TValues,
    value: string,
    helpers: {
      setValues: React.Dispatch<React.SetStateAction<TValues>>
      setErrors: React.Dispatch<React.SetStateAction<TFieldErrors>>
      setFormError: React.Dispatch<React.SetStateAction<string>>
      currentValues: TValues
    }
  ) => void
  onDelete?: (entity: TEntity) => Promise<unknown>
}

export function useFormDialog<TValues, TFieldErrors, TEntity = never>({
  createDefaults,
  createFormValues,
  validate,
  onSubmit,
  onValueChange,
  onDelete,
}: FormDialogOptions<TValues, TFieldErrors, TEntity>) {
  const createDefaultsRef = useRef(createDefaults)
  createDefaultsRef.current = createDefaults

  const createFormValuesRef = useRef(createFormValues)
  createFormValuesRef.current = createFormValues

  const validateRef = useRef(validate)
  validateRef.current = validate

  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  const onValueChangeRef = useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  const onDeleteRef = useRef(onDelete)
  onDeleteRef.current = onDelete

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<TEntity | null>(null)
  const [values, setValues] = useState<TValues>(createDefaults)
  const [errors, setErrors] = useState<TFieldErrors>({} as TFieldErrors)
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)

  const resetDialogState = () => {
    setErrors({} as TFieldErrors)
    setFormError("")
    setPending(false)
  }

  const openCreateDialog = () => {
    setEditingEntity(null)
    setValues(createDefaultsRef.current())
    resetDialogState()
    setDialogOpen(true)
  }

  const openEditDialog = (entity: TEntity) => {
    if (!createFormValuesRef.current) return
    setEditingEntity(entity)
    setValues(createFormValuesRef.current(entity))
    resetDialogState()
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      setEditingEntity(null)
      resetDialogState()
    }
  }

  const handleValueChange = (name: keyof TValues, value: string) => {
    if (onValueChangeRef.current) {
      onValueChangeRef.current(name, value, {
        setValues,
        setErrors,
        setFormError,
        currentValues: values,
      })
    } else {
      setValues((current) => ({ ...current, [name]: value }))
      setErrors((current) => ({ ...current, [name]: undefined }))
      setFormError("")
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateRef.current(values)
    if (Object.keys(nextErrors as Record<string, unknown>).length > 0) {
      setErrors(nextErrors)
      return
    }

    setPending(true)
    setFormError("")

    try {
      await onSubmitRef.current(values)
      setDialogOpen(false)
      setEditingEntity(null)
      setValues(createDefaultsRef.current())
      setErrors({} as TFieldErrors)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not save. Please try again."
      )
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async () => {
    if (!editingEntity || !onDeleteRef.current) return

    setPending(true)
    setFormError("")

    try {
      await onDeleteRef.current(editingEntity)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not delete. Please try again."
      )
    } finally {
      setPending(false)
    }
  }

  return {
    dialogOpen,
    values,
    setValues,
    errors,
    setErrors,
    formError,
    setFormError,
    pending,
    isEditing: editingEntity !== null,
    editingEntity,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    handleValueChange,
    handleSubmit,
    handleDelete,
  }
}
