"use client"

import { CheckIcon } from "lucide-react"
import type { ReferenceComboboxAction } from "@/lib/reference-entities"
import type { ReferenceComboboxOption } from "@/components/dashboard/reference-combobox-field"
import { cn } from "@/lib/utils"

export function ReferenceAutocompleteMenu({
  actions,
  emptyMessage,
  filteredOptions,
  highlightedIndex,
  id,
  onActionSelect,
  onHighlightChange,
  onOptionSelect,
  open,
  value,
}: {
  actions: Array<ReferenceComboboxAction>
  emptyMessage: string
  filteredOptions: Array<ReferenceComboboxOption>
  highlightedIndex: number
  id: string
  onActionSelect: (action: ReferenceComboboxAction) => void
  onHighlightChange: (index: number) => void
  onOptionSelect: (option: ReferenceComboboxOption) => void
  open: boolean
  value: string
}) {
  if (!open) {
    return null
  }

  return (
    <div
      id={`${id}-listbox`}
      role="listbox"
      className="absolute top-[calc(100%+6px)] left-0 z-50 w-full overflow-hidden rounded-3xl border border-border/70 bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5"
    >
      {filteredOptions.length > 0 ? (
        <div className="max-h-72 overflow-y-auto p-1.5">
          {filteredOptions.map((option, index) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={cn(
                  "relative flex w-full items-center gap-2.5 rounded-2xl py-2 pr-8 pl-3 text-left text-sm font-medium outline-hidden transition-colors",
                  highlightedIndex === index || isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onMouseEnter={() => onHighlightChange(index)}
                onClick={() => onOptionSelect(option)}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? (
                  <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}

      {actions.length > 0 ? (
        <div
          className={cn(
            "p-1.5",
            filteredOptions.length > 0 ? "border-t border-border/70" : null
          )}
        >
          <div className="flex flex-col gap-1">
            {actions.map((action, actionIndex) => {
              const index = filteredOptions.length + actionIndex

              return (
                <button
                  key={action.key}
                  type="button"
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 rounded-2xl px-3 py-2 text-left text-sm outline-hidden transition-colors",
                    highlightedIndex === index
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onMouseEnter={() => onHighlightChange(index)}
                  onClick={() => onActionSelect(action)}
                >
                  <span>{action.label}</span>
                  {action.description ? (
                    <span
                      className={cn(
                        "text-xs font-normal",
                        highlightedIndex === index
                          ? "text-accent-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {action.description}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {filteredOptions.length === 0 && actions.length === 0 ? (
        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  )
}
