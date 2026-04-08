"use client"

import type { ReferenceComboboxAction } from "@/lib/reference-entities"
import { Button } from "@/components/ui/button"

export function ReferenceComboboxActions({
  actions,
  onSelect,
}: {
  actions: Array<ReferenceComboboxAction>
  onSelect: (action: ReferenceComboboxAction) => void
}) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div
      className="border-t border-border/70 p-1.5"
      onMouseDown={preventDropdownBlur}
      onPointerDown={preventDropdownBlur}
    >
      <div className="flex flex-col gap-1">
        {actions.map((action) => (
          <Button
            key={action.key}
            type="button"
            variant="ghost"
            className="h-auto justify-start px-3 py-2 text-left"
            onMouseDown={preventDropdownBlur}
            onPointerDown={preventDropdownBlur}
            onClick={() => onSelect(action)}
          >
            <span className="flex flex-col items-start gap-0.5">
              <span>{action.label}</span>
              {action.description ? (
                <span className="text-xs font-normal text-muted-foreground">
                  {action.description}
                </span>
              ) : null}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}

function preventDropdownBlur(event: {
  preventDefault: () => void
  stopPropagation: () => void
}) {
  event.preventDefault()
  event.stopPropagation()
}
