import type {
  AccountFieldErrors,
  AccountFormValues,
  AccountType,
} from "@/components/dashboard/accounts/accounts-shared"
import { FormErrorMessage } from "@/components/form-error-message"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { accountTypeOptions } from "@/lib/money"

export function AccountFormFields({
  values,
  errors,
  onValueChange,
  onIncludeInTotalsChange,
}: {
  values: AccountFormValues
  errors: AccountFieldErrors
  onValueChange: (
    name: keyof Omit<AccountFormValues, "includeInTotals">,
    value: string
  ) => void
  onIncludeInTotalsChange: (checked: boolean) => void
}) {
  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="account-name">
            <FieldTitle>Name</FieldTitle>
          </FieldLabel>
          <Input
            id="account-name"
            value={values.name}
            onChange={(event) => onValueChange("name", event.target.value)}
            placeholder="Main checking"
          />
          <FormErrorMessage error={errors.name} />
        </Field>

        <Field>
          <FieldLabel htmlFor="account-type">
            <FieldTitle>Type</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="account-type"
            value={values.type}
            onChange={(event) =>
              onValueChange("type", event.target.value as AccountType)
            }
          >
            {accountTypeOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="account-opening-balance">
            <FieldTitle>Opening balance</FieldTitle>
          </FieldLabel>
          <Input
            id="account-opening-balance"
            type="number"
            min="0"
            step="0.01"
            value={values.openingBalance}
            onChange={(event) =>
              onValueChange("openingBalance", event.target.value)
            }
          />
          <FormErrorMessage error={errors.openingBalance} />
        </Field>

        <Field>
          <FieldLabel htmlFor="account-color">
            <FieldTitle>Color</FieldTitle>
          </FieldLabel>
          <div className="flex items-center gap-3">
            <Input
              id="account-color"
              type="color"
              value={values.color || "#1d4ed8"}
              onChange={(event) => onValueChange("color", event.target.value)}
              className="h-10 w-16 rounded-3xl p-1"
            />
            <p className="text-sm text-muted-foreground">
              Optional accent for faster scanning.
            </p>
          </div>
        </Field>
      </div>

      <Field orientation="responsive">
        <div className="space-y-1">
          <FieldTitle>Include in totals</FieldTitle>
          <FieldDescription>
            Use this account in overall balance totals across the dashboard.
          </FieldDescription>
        </div>
        <Switch
          checked={values.includeInTotals}
          onCheckedChange={onIncludeInTotalsChange}
          aria-label="Include account in totals"
        />
      </Field>
    </FieldGroup>
  )
}
