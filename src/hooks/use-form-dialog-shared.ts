export type FormDialogChangeHelpers<TValues, TFieldErrors> = {
  setValues: React.Dispatch<React.SetStateAction<TValues>>
  setErrors: React.Dispatch<React.SetStateAction<TFieldErrors>>
  setFormError: React.Dispatch<React.SetStateAction<string>>
  currentValues: TValues
}

export type FormDialogOptions<TValues, TFieldErrors, TEntity> = {
  createDefaults: () => TValues
  createFormValues?: (entity: TEntity) => TValues
  validate: (values: TValues) => TFieldErrors
  onSubmit: (values: TValues) => Promise<unknown>
  onSubmitSuccess?: (
    result: unknown,
    values: TValues
  ) => Promise<unknown> | unknown
  onValueChange?: (
    name: keyof TValues,
    value: string,
    helpers: FormDialogChangeHelpers<TValues, TFieldErrors>
  ) => void
  onDelete?: (entity: TEntity) => Promise<unknown>
}
