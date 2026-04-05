import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
  TransactionStatus,
  TransactionType,
} from "@/components/dashboard/transactions/transactions-shared"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { FormErrorMessage } from "@/components/form-error-message"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import {
  getCategoryOptions,
  resolveValidOption,
} from "@/components/dashboard/transactions/transactions-shared"
import { transactionStatusOptions, transactionTypeOptions } from "@/lib/money"

export function TransactionFormFields({
  values,
  errors,
  accountOptions,
  incomeCategoryOptions,
  expenseCategoryOptions,
  onValueChange,
  onTypeChange,
  onAccountChange,
}: {
  values: TransactionFormValues
  errors: TransactionFieldErrors
  accountOptions: Array<AccountOption>
  incomeCategoryOptions: Array<CategoryOption>
  expenseCategoryOptions: Array<CategoryOption>
  onValueChange: (name: keyof TransactionFormValues, value: string) => void
  onTypeChange: (value: TransactionType) => void
  onAccountChange: (value: string) => void
}) {
  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )

  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="transaction-type">
            <FieldTitle>Type</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="transaction-type"
            value={values.type}
            onChange={(event) =>
              onTypeChange(event.target.value as TransactionType)
            }
          >
            {transactionTypeOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="transaction-status">
            <FieldTitle>Status</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="transaction-status"
            value={values.status}
            onChange={(event) =>
              onValueChange("status", event.target.value as TransactionStatus)
            }
          >
            {transactionStatusOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="transaction-amount">
            <FieldTitle>Amount</FieldTitle>
          </FieldLabel>
          <Input
            id="transaction-amount"
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={(event) => onValueChange("amount", event.target.value)}
          />
          <FormErrorMessage error={errors.amount} />
        </Field>

        <Field>
          <FieldLabel htmlFor="transaction-date">
            <FieldTitle>Date</FieldTitle>
          </FieldLabel>
          <Input
            id="transaction-date"
            type="date"
            value={values.date}
            onChange={(event) => onValueChange("date", event.target.value)}
          />
          <FormErrorMessage error={errors.date} />
        </Field>
      </div>

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

      <Field>
        <FieldLabel htmlFor="transaction-description">
          <FieldTitle>Description</FieldTitle>
        </FieldLabel>
        <Input
          id="transaction-description"
          value={values.description}
          onChange={(event) => onValueChange("description", event.target.value)}
          placeholder={
            values.type === "transfer" ? "Transfer to savings" : "Groceries"
          }
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="transaction-note">
          <FieldTitle>Note</FieldTitle>
        </FieldLabel>
        <Textarea
          id="transaction-note"
          value={values.note}
          onChange={(event) => onValueChange("note", event.target.value)}
          placeholder="Optional context"
        />
      </Field>
    </FieldGroup>
  )
}
