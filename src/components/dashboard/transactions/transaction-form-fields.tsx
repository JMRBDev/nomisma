import type {
  TransactionStatus,
} from "@/components/dashboard/transactions/transactions-shared"
import type { TransactionFormFieldsProps } from "@/components/dashboard/transactions/transaction-form-types"
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
import { m } from "@/lib/i18n-client"
import {
  getTransactionStatusOptions,
  getTransactionTypeOptions,
} from "@/lib/money"
import { TransactionSelectFields } from "@/components/dashboard/transactions/transaction-select-fields"

export function TransactionFormFields({
  values,
  errors,
  accountOptions,
  allAccountOptions,
  categoryOptions,
  allCategoryOptions,
  onValueChange,
  onTypeChange,
  onAccountChange,
  onCreateAccount,
  onUnarchiveAccount,
  onCreateCategory,
  onUnarchiveCategory,
}: TransactionFormFieldsProps) {
  const resolvedCategoryOptions = getCategoryOptions(values.type, categoryOptions)
  const transactionStatusOptions = getTransactionStatusOptions()
  const transactionTypeOptions = getTransactionTypeOptions()

  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="transaction-type">
            <FieldTitle>{m.common_type()}</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="transaction-type"
            value={values.type}
            onChange={(event) =>
              onTypeChange(event.target.value as TransactionFormFieldsProps["values"]["type"])
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
            <FieldTitle>{m.common_status()}</FieldTitle>
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
            <FieldTitle>{m.common_amount()}</FieldTitle>
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
            <FieldTitle>{m.common_date()}</FieldTitle>
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
        allAccountOptions={allAccountOptions}
        categoryOptions={resolvedCategoryOptions}
        allCategoryOptions={allCategoryOptions}
        onValueChange={onValueChange}
        onAccountChange={onAccountChange}
        onCreateAccount={onCreateAccount}
        onUnarchiveAccount={onUnarchiveAccount}
        onCreateCategory={onCreateCategory}
        onUnarchiveCategory={onUnarchiveCategory}
      />
      <Field>
        <FieldLabel htmlFor="transaction-description">
          <FieldTitle>{m.common_description()}</FieldTitle>
        </FieldLabel>
        <Input
          id="transaction-description"
          value={values.description}
          onChange={(event) => onValueChange("description", event.target.value)}
          placeholder={
            values.type === "transfer"
              ? m.transaction_form_transfer_placeholder()
              : m.transaction_form_expense_placeholder()
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="transaction-note">
          <FieldTitle>{m.common_note()}</FieldTitle>
        </FieldLabel>
        <Textarea
          id="transaction-note"
          value={values.note}
          onChange={(event) => onValueChange("note", event.target.value)}
          placeholder={m.transaction_form_note_placeholder()}
        />
      </Field>
    </FieldGroup>
  )
}
