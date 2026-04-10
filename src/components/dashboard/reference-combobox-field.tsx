"use client"

import { useMemo } from "react"
import type { ReactNode } from "react"
import type { ReferenceComboboxAction } from "@/lib/reference-entities"
import { ReferenceAutocompleteField } from "@/components/dashboard/reference-autocomplete-field"
import { m } from "@/lib/i18n-client"

export type ReferenceComboboxOption = {
  value: string
  label: string
  searchText?: string
}

export function ReferenceComboboxField({
  id,
  label,
  value,
  options,
  error,
  placeholder,
  emptyMessage = m.common_no_matches_found(),
  disabled = false,
  description,
  onValueChange,
  getActions,
}: {
  id: string
  label: string
  value: string
  options: Array<ReferenceComboboxOption>
  error?: string
  placeholder: string
  emptyMessage?: string
  disabled?: boolean
  description?: ReactNode
  onValueChange: (value: string) => void
  getActions?: (query: string) => Array<ReferenceComboboxAction>
}) {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  )

  return (
    <ReferenceAutocompleteField
      id={id}
      label={label}
      value={value}
      options={options}
      selectedOption={selectedOption}
      error={error}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
      disabled={disabled}
      description={description}
      onValueChange={onValueChange}
      getActions={getActions}
    />
  )
}
