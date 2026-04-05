import type { ReactNode } from "react"
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field"
import { NativeSelect } from "@/components/ui/native-select"

export function DashboardFilterSelectField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        <FieldTitle>{label}</FieldTitle>
      </FieldLabel>
      <NativeSelect
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </NativeSelect>
    </Field>
  )
}
