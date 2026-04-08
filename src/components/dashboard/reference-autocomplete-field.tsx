"use client"

import { ChevronDownIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { ReferenceComboboxAction } from "@/lib/reference-entities"
import type { ReferenceComboboxOption } from "@/components/dashboard/reference-combobox-field"
import { ReferenceAutocompleteMenu } from "@/components/dashboard/reference-autocomplete-menu"
import { useReferenceAutocomplete } from "@/components/dashboard/use-reference-autocomplete"
import { FormErrorMessage } from "@/components/form-error-message"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export function ReferenceAutocompleteField({
  id,
  label,
  value,
  options,
  selectedOption,
  error,
  placeholder,
  emptyMessage,
  disabled,
  description,
  onValueChange,
  getActions,
}: {
  id: string
  label: string
  value: string
  options: Array<ReferenceComboboxOption>
  selectedOption: ReferenceComboboxOption | null
  error?: string
  placeholder: string
  emptyMessage: string
  disabled: boolean
  description?: ReactNode
  onValueChange: (value: string) => void
  getActions?: (query: string) => Array<ReferenceComboboxAction>
}) {
  const autocomplete = useReferenceAutocomplete({
    getActions,
    onValueChange,
    options,
    selectedLabel: selectedOption?.label ?? "",
    selectedOption,
    value,
  })

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>
        <FieldTitle>{label}</FieldTitle>
      </FieldLabel>
      <div
        className="relative"
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget as Node | null
          if (nextTarget && event.currentTarget.contains(nextTarget)) return
          autocomplete.setActiveIndex(-1)
          autocomplete.setOpen(false)
        }}
      >
        <InputGroup className="w-full">
          <InputGroupInput
            id={id}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={`${id}-listbox`}
            aria-expanded={autocomplete.open}
            aria-invalid={Boolean(error)}
            value={autocomplete.query}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            onFocus={() => !disabled && autocomplete.setOpen(true)}
            onClick={() => !disabled && autocomplete.setOpen(true)}
            onChange={(event) => autocomplete.handleInputChange(event.target.value)}
            onKeyDown={autocomplete.handleInputKeyDown}
          />
          <InputGroupAddon align="inline-end">
            {autocomplete.query ? (
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                aria-label={`Clear ${label.toLowerCase()}`}
                disabled={disabled}
                onClick={autocomplete.clearSelection}
              >
                <XIcon className="pointer-events-none" />
              </InputGroupButton>
            ) : null}
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              aria-label={`${autocomplete.open ? "Close" : "Open"} ${label.toLowerCase()} options`}
              aria-expanded={autocomplete.open}
              disabled={disabled}
              onClick={() => {
                autocomplete.setOpen((open) => !open)
                autocomplete.setActiveIndex(autocomplete.open ? -1 : 0)
              }}
            >
              <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <ReferenceAutocompleteMenu
          actions={autocomplete.actions}
          emptyMessage={emptyMessage}
          filteredOptions={autocomplete.filteredOptions}
          highlightedIndex={autocomplete.highlightedIndex}
          id={id}
          onActionSelect={autocomplete.selectAction}
          onHighlightChange={autocomplete.setActiveIndex}
          onOptionSelect={autocomplete.selectOption}
          open={autocomplete.open}
          value={value}
        />
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FormErrorMessage error={error} />
    </Field>
  )
}
