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
import { getCategoryOptions } from "@/components/dashboard/transactions/transactions-shared"
import { transactionStatusOptions, transactionTypeOptions } from "@/lib/money"
import { TransactionSelectFields } from "@/components/dashboard/transactions/transaction-select-fields"

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
      <TransactionSelectFields
        values={values}
        errors={errors}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        onValueChange={onValueChange}
        onAccountChange={onAccountChange}
      />
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
