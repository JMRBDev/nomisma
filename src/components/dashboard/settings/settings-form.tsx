import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../../../convex/_generated/api"
import type { SettingsFormValues } from "@/components/dashboard/settings/settings-shared"
import { FormErrorMessage } from "@/components/form-error-message"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import {
  defaultCurrencyOptions,
  weekStartsOnOptions,
} from "@/components/dashboard/settings/settings-shared"
import { SettingsSelect } from "@/components/dashboard/settings/settings-select"

export function SettingsForm({
  initialValues,
}: {
  initialValues: SettingsFormValues
}) {
  const upsertSettings = useConvexMutation(api.settings.upsertSettings)
  const [values, setValues] = useState(initialValues)
  const [savedValues, setSavedValues] = useState(initialValues)
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)

  const currencyOptions = defaultCurrencyOptions.some(
    (option) => option.value === values.baseCurrency
  )
    ? defaultCurrencyOptions
    : [
        {
          value: values.baseCurrency,
          label: `${values.baseCurrency} (current)`,
        },
        ...defaultCurrencyOptions,
      ]

  const isDirty =
    values.baseCurrency !== savedValues.baseCurrency ||
    values.weekStartsOn !== savedValues.weekStartsOn

  const handleValueChange = (name: keyof SettingsFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
    setFormError("")
  }

  const handleReset = () => {
    setValues(savedValues)
    setFormError("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setFormError("")

    try {
      await upsertSettings({
        baseCurrency: values.baseCurrency,
        weekStartsOn: values.weekStartsOn,
      })
      setSavedValues(values)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save settings."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldContent>
            <FieldTitle className="font-heading text-lg">
              Base currency
            </FieldTitle>
            <FieldDescription>
              Format balances, totals, and budget limits with one shared
              currency.
            </FieldDescription>
          </FieldContent>
          <SettingsSelect
            value={values.baseCurrency}
            onValueChange={(value) => handleValueChange("baseCurrency", value)}
            options={currencyOptions}
            placeholder="Choose a currency"
          />
        </Field>

        <Field>
          <FieldContent>
            <FieldTitle className="font-heading text-lg">
              Week starts on
            </FieldTitle>
            <FieldDescription>
              Control how weekly ranges and calendars are aligned across the
              app.
            </FieldDescription>
          </FieldContent>
          <SettingsSelect
            value={values.weekStartsOn}
            onValueChange={(value) => handleValueChange("weekStartsOn", value)}
            options={weekStartsOnOptions}
            placeholder="Choose a day"
          />
        </Field>
      </FieldGroup>

      <Separator />

      {formError ? <FormErrorMessage error={formError} /> : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={!isDirty || pending}
        >
          Reset
        </Button>
        <Button type="submit" disabled={!isDirty || pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
