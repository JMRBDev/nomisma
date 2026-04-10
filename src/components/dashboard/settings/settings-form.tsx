import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { useRouter } from "@tanstack/react-router"
import { setLocale } from "@/lib/i18n-client"
import { m } from "@/lib/i18n-client"
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
  getDefaultCurrencyOptions,
  getLocaleOptions,
  getWeekStartsOnOptions,
} from "@/components/dashboard/settings/settings-shared"
import { SettingsSelect } from "@/components/dashboard/settings/settings-select"

export function SettingsForm({
  initialValues,
}: {
  initialValues: SettingsFormValues
}) {
  const router = useRouter()
  const upsertSettings = useConvexMutation(api.settings.upsertSettings)
  const [values, setValues] = useState(initialValues)
  const [savedValues, setSavedValues] = useState(initialValues)
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)
  const defaultCurrencyOptions = getDefaultCurrencyOptions()
  const localeOptions = getLocaleOptions()
  const weekStartsOnOptions = getWeekStartsOnOptions()

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
    values.locale !== savedValues.locale ||
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
        locale: values.locale,
        weekStartsOn: values.weekStartsOn,
      })
      setSavedValues(values)

      if (values.locale !== savedValues.locale) {
        await setLocale(values.locale, { reload: false })
        await router.invalidate()
        return
      }

      await router.invalidate()
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : m.settings_save_error()
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
              {m.settings_base_currency_title()}
            </FieldTitle>
            <FieldDescription>
              {m.settings_base_currency_description()}
            </FieldDescription>
          </FieldContent>
          <SettingsSelect
            value={values.baseCurrency}
            onValueChange={(value) => handleValueChange("baseCurrency", value)}
            options={currencyOptions}
            placeholder={m.settings_choose_currency()}
          />
        </Field>

        <Field>
          <FieldContent>
            <FieldTitle className="font-heading text-lg">
              {m.settings_language_title()}
            </FieldTitle>
            <FieldDescription>
              {m.settings_language_description()}
            </FieldDescription>
          </FieldContent>
          <SettingsSelect
            value={values.locale}
            onValueChange={(value) => handleValueChange("locale", value)}
            options={localeOptions}
            placeholder={m.settings_choose_language()}
          />
        </Field>

        <Field>
          <FieldContent>
            <FieldTitle className="font-heading text-lg">
              {m.settings_week_starts_title()}
            </FieldTitle>
            <FieldDescription>
              {m.settings_week_starts_description()}
            </FieldDescription>
          </FieldContent>
          <SettingsSelect
            value={values.weekStartsOn}
            onValueChange={(value) => handleValueChange("weekStartsOn", value)}
            options={weekStartsOnOptions}
            placeholder={m.settings_choose_day()}
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
          {m.common_reset()}
        </Button>
        <Button type="submit" disabled={!isDirty || pending}>
          {pending ? m.common_saving() : m.settings_save_changes()}
        </Button>
      </div>
    </form>
  )
}
