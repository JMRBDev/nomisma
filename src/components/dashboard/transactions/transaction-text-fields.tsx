import type { TransactionFormValues } from "@/components/dashboard/transactions/transactions-shared"
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { t } from "@/lib/i18n"

export function TransactionTextFields({
  values,
  onValueChange,
}: {
  values: Pick<TransactionFormValues, "description" | "note" | "type">
  onValueChange: (
    field: keyof Pick<TransactionFormValues, "description" | "note">,
    value: string
  ) => void
}) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="transaction-description">
          <FieldTitle>{t("common_description")}</FieldTitle>
        </FieldLabel>
        <Input
          id="transaction-description"
          value={values.description}
          onChange={(event) => onValueChange("description", event.target.value)}
          placeholder={
            values.type === "transfer"
              ? t("transaction_form_transfer_placeholder")
              : t("transaction_form_expense_placeholder")
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="transaction-note">
          <FieldTitle>{t("common_note")}</FieldTitle>
        </FieldLabel>
        <Textarea
          id="transaction-note"
          value={values.note}
          onChange={(event) => onValueChange("note", event.target.value)}
          placeholder={t("transaction_form_note_placeholder")}
        />
      </Field>
    </>
  )
}
