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
  FieldTitle,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { defaultCurrencyOptions } from "@/components/dashboard/settings/settings-shared"

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

  const isDirty = values.baseCurrency !== savedValues.baseCurrency

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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <Field>
        <FieldContent>
          <FieldTitle className="font-heading text-lg">Base currency</FieldTitle>
          <FieldDescription>
            Format balances, totals, and budget limits with one shared
            currency.
          </FieldDescription>
        </FieldContent>

        <Select
          value={values.baseCurrency}
          onValueChange={(value) => handleValueChange("baseCurrency", value)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Choose a currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {currencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Separator />

      {formError ? (
        <>
          <FormErrorMessage error={formError} />
          <Separator className="mt-5" />
        </>
      ) : null}

      <div className="flex justify-end flex-wrap gap-2">
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
