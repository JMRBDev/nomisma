import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { useRouter } from "@tanstack/react-router"
import { api } from "../../../../convex/_generated/api"
import type { SettingsFormValues } from "@/components/dashboard/settings/settings-shared"
import { t } from "@/lib/i18n"
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
      await router.invalidate()
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("settings_save_error")
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
              {t("settings_base_currency_title")}
            </FieldTitle>
            <FieldDescription>
              {t("settings_base_currency_description")}
            </FieldDescription>
          </FieldContent>
          <SettingsSelect
            value={values.baseCurrency}
            onValueChange={(value) => handleValueChange("baseCurrency", value)}
            options={currencyOptions}
            placeholder={t("settings_choose_currency")}
          />
        </Field>
        <Field>
          <FieldContent>
            <FieldTitle className="font-heading text-lg">
              {t("settings_week_starts_title")}
            </FieldTitle>
            <FieldDescription>
              {t("settings_week_starts_description")}
            </FieldDescription>
          </FieldContent>
          <SettingsSelect
            value={values.weekStartsOn}
            onValueChange={(value) => handleValueChange("weekStartsOn", value)}
            options={weekStartsOnOptions}
            placeholder={t("settings_choose_day")}
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
          {t("common_reset")}
        </Button>
        <Button type="submit" disabled={!isDirty || pending}>
          {pending ? t("common_saving") : t("settings_save_changes")}
        </Button>
      </div>
    </form>
  )
}
