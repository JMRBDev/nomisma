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
import { m } from "@/paraglide/messages"

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
      createDescription: m.recurring_account_reference_description(),
      unarchiveDescription: m.recurring_account_restore_description(),
      onCreate: onCreateAccount,
      onUnarchive: (account) => onUnarchiveAccount(account._id),
    })
  }

  const getCategoryActions = (query: string) => {
    return getCreateOrRestoreActions({
      options: allCategoryOptions,
      query,
      createKey: "create-category",
      unarchiveKey: "unarchive-category",
      createDescription: m.recurring_category_reference_description(),
      unarchiveDescription: m.recurring_category_restore_description(),
      onCreate: onCreateCategory,
      onUnarchive: (category) => onUnarchiveCategory(category._id),
    })
  }

  return (
    <>
      <ReferenceComboboxField
        id="recurring-account"
        label={
          values.type === "income"
            ? m.recurring_deposit_account()
            : m.recurring_payment_account()
        }
        value={resolveValidOption(values.accountId, accountOptions)}
        options={accountOptions.map((account) => ({
          value: account._id,
          label: account.name,
        }))}
        error={errors.accountId}
        placeholder={m.recurring_search_account_placeholder()}
        emptyMessage={m.transactions_no_accounts_found()}
        onValueChange={(nextValue) => onValueChange("accountId", nextValue)}
        getActions={getAccountActions}
      />

      <ReferenceComboboxField
        id="recurring-category"
        label={m.common_category()}
        value={resolveValidOption(values.categoryId, categoryOptions)}
        options={categoryOptions.map((category) => ({
          value: category._id,
          label: category.name,
        }))}
        error={errors.categoryId}
        placeholder={m.recurring_search_category_placeholder()}
        emptyMessage={m.transactions_no_categories_found()}
        onValueChange={(nextValue) => onValueChange("categoryId", nextValue)}
        getActions={getCategoryActions}
      />

      <Field>
        <FieldLabel htmlFor="recurring-start-date">
          <FieldTitle>{m.recurring_start_date()}</FieldTitle>
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
          <FieldTitle>{m.recurring_first_due_date()}</FieldTitle>
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
          <FieldTitle>{m.recurring_end_date()}</FieldTitle>
        </FieldLabel>
        <Input
          id="recurring-end-date"
          type="date"
          value={values.endDate}
          onChange={(event) => onValueChange("endDate", event.target.value)}
        />
        <FieldDescription>
          {m.recurring_end_date_description()}
        </FieldDescription>
        <FormErrorMessage error={errors.endDate} />
      </Field>
    </>
  )
}
