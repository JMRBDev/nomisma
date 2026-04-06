import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
} from "@/components/dashboard/transactions/transactions-shared"
import { resolveValidOption } from "@/components/dashboard/transactions/transactions-shared"
import { FormErrorMessage } from "@/components/form-error-message"
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export function TransactionSelectFields({
  values,
  errors,
  accountOptions,
  categoryOptions,
  onValueChange,
  onAccountChange,
}: {
  values: TransactionFormValues
  errors: TransactionFieldErrors
  accountOptions: Array<AccountOption>
  categoryOptions: Array<CategoryOption>
  onValueChange: (name: keyof TransactionFormValues, value: string) => void
  onAccountChange: (value: string) => void
}) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="transaction-account">
          <FieldTitle>
            {values.type === "transfer" ? "From account" : "Account"}
          </FieldTitle>
        </FieldLabel>
        <NativeSelect
          id="transaction-account"
          value={resolveValidOption(values.accountId, accountOptions)}
          onChange={(event) => onAccountChange(event.target.value)}
        >
          {accountOptions.map((account) => (
            <NativeSelectOption key={account._id} value={account._id}>
              {account.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FormErrorMessage error={errors.accountId} />
      </Field>

      {values.type === "transfer" ? (
        <Field>
          <FieldLabel htmlFor="transaction-to-account">
            <FieldTitle>Destination account</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="transaction-to-account"
            value={values.toAccountId}
            onChange={(event) =>
              onValueChange("toAccountId", event.target.value)
            }
          >
            <NativeSelectOption value="">Choose account</NativeSelectOption>
            {accountOptions
              .filter((account) => account._id !== values.accountId)
              .map((account) => (
                <NativeSelectOption key={account._id} value={account._id}>
                  {account.name}
                </NativeSelectOption>
              ))}
          </NativeSelect>
          <FormErrorMessage error={errors.toAccountId} />
        </Field>
      ) : (
        <Field>
          <FieldLabel htmlFor="transaction-category">
            <FieldTitle>Category</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="transaction-category"
            value={resolveValidOption(values.categoryId, categoryOptions)}
            onChange={(event) =>
              onValueChange("categoryId", event.target.value)
            }
            disabled={categoryOptions.length === 0}
          >
            {categoryOptions.length === 0 ? (
              <NativeSelectOption value="">
                Create a category first
              </NativeSelectOption>
            ) : null}
            {categoryOptions.map((category) => (
              <NativeSelectOption key={category._id} value={category._id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FormErrorMessage error={errors.categoryId} />
        </Field>
      )}
    </>
  )
}
