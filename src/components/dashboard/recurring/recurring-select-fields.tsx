import type {
  RecurringAccountOption,
  RecurringCategoryOption,
  RecurringFieldErrors,
  RecurringFormValues,
} from "@/components/dashboard/recurring/recurring-shared"
import { resolveValidOption } from "@/components/dashboard/recurring/recurring-shared"
import { FormErrorMessage } from "@/components/form-error-message"
import { ReferenceComboboxField } from "@/components/dashboard/reference-combobox-field"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getCreateOrRestoreActions } from "@/lib/reference-entities"

export function RecurringSelectFields({
  values,
  errors,
  accountOptions,
  allAccountOptions,
  categoryOptions,
  allCategoryOptions,
  onValueChange,
  onCreateAccount,
  onUnarchiveAccount,
  onCreateCategory,
  onUnarchiveCategory,
}: {
  values: RecurringFormValues
  errors: RecurringFieldErrors
  accountOptions: Array<RecurringAccountOption>
  allAccountOptions: Array<RecurringAccountOption>
  categoryOptions: Array<RecurringCategoryOption>
  allCategoryOptions: Array<RecurringCategoryOption>
  onValueChange: (name: keyof RecurringFormValues, value: string) => void
  onCreateAccount: (name: string) => void
  onUnarchiveAccount: (accountId: string) => void
  onCreateCategory: (name: string) => void
  onUnarchiveCategory: (categoryId: string) => void
}) {
  const getAccountActions = (query: string) => {
    return getCreateOrRestoreActions({
      options: allAccountOptions,
      query,
      createKey: "create-account",
      unarchiveKey: "unarchive-account",
      createDescription: "Finish account setup and select it here.",
      unarchiveDescription: "Restore this account and select it here.",
      onCreate: onCreateAccount,
      onUnarchive: (account) => onUnarchiveAccount(account._id),
    })
  }

  const categoryReferenceOptions = allCategoryOptions.filter(
    (category) => category.kind === values.type
  )

  const getCategoryActions = (query: string) => {
    return getCreateOrRestoreActions({
      options: categoryReferenceOptions,
      query,
      createKey: "create-category",
      unarchiveKey: "unarchive-category",
      createDescription: "Finish category setup and select it here.",
      unarchiveDescription: "Restore this category and select it here.",
      onCreate: onCreateCategory,
      onUnarchive: (category) => onUnarchiveCategory(category._id),
    })
  }

  return (
    <>
      <ReferenceComboboxField
        id="recurring-account"
        label={values.type === "income" ? "Deposit account" : "Payment account"}
        value={resolveValidOption(values.accountId, accountOptions)}
        options={accountOptions.map((account) => ({
          value: account._id,
          label: account.name,
        }))}
        error={errors.accountId}
        placeholder="Search or create an account"
        emptyMessage="No accounts found."
        onValueChange={(nextValue) => onValueChange("accountId", nextValue)}
        getActions={getAccountActions}
      />

      <ReferenceComboboxField
        id="recurring-category"
        label={values.type === "income" ? "Income category" : "Expense category"}
        value={resolveValidOption(values.categoryId, categoryOptions)}
        options={categoryOptions.map((category) => ({
          value: category._id,
          label: category.name,
        }))}
        error={errors.categoryId}
        placeholder={`Search or create a ${values.type} category`}
        emptyMessage={`No ${values.type} categories found.`}
        onValueChange={(nextValue) => onValueChange("categoryId", nextValue)}
        getActions={getCategoryActions}
      />

      <Field>
        <FieldLabel htmlFor="recurring-start-date">
          <FieldTitle>Start date</FieldTitle>
        </FieldLabel>
        <Input
          id="recurring-start-date"
          type="date"
          value={values.startDate}
          onChange={(event) => onValueChange("startDate", event.target.value)}
        />
        <FormErrorMessage error={errors.startDate} />
      </Field>

      <Field>
        <FieldLabel htmlFor="recurring-next-due-date">
          <FieldTitle>First due date</FieldTitle>
        </FieldLabel>
        <Input
          id="recurring-next-due-date"
          type="date"
          value={values.nextDueDate}
          onChange={(event) => onValueChange("nextDueDate", event.target.value)}
        />
        <FormErrorMessage error={errors.nextDueDate} />
      </Field>

      <Field>
        <FieldLabel htmlFor="recurring-end-date">
          <FieldTitle>End date</FieldTitle>
        </FieldLabel>
        <Input
          id="recurring-end-date"
          type="date"
          value={values.endDate}
          onChange={(event) => onValueChange("endDate", event.target.value)}
        />
        <FieldDescription>
          Leave blank to keep this rule active.
        </FieldDescription>
        <FormErrorMessage error={errors.endDate} />
      </Field>
    </>
  )
}
