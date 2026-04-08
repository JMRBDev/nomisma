"use client"

import {
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import type { KeyboardEvent } from "react"
import type { ReferenceComboboxAction } from "@/lib/reference-entities"
import type { ReferenceComboboxOption } from "@/components/dashboard/reference-combobox-field"
import { normalizeEntityName } from "@/lib/reference-entities"

export function useReferenceAutocomplete({
  getActions,
  onValueChange,
  options,
  selectedLabel,
  selectedOption,
  value,
}: {
  getActions?: (query: string) => Array<ReferenceComboboxAction>
  onValueChange: (value: string) => void
  options: Array<ReferenceComboboxOption>
  selectedLabel: string
  selectedOption: ReferenceComboboxOption | null
  value: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(selectedLabel)
  const [activeIndex, setActiveIndex] = useState(-1)
  const preserveQueryOnNextSyncRef = useRef(false)
  const deferredQuery = useDeferredValue(query)
  const normalizedDeferredQuery = normalizeEntityName(deferredQuery)

  useLayoutEffect(() => {
    if (preserveQueryOnNextSyncRef.current) {
      preserveQueryOnNextSyncRef.current = false
      return
    }

    setQuery(selectedLabel)
  }, [selectedLabel, value])

  const filteredOptions = useMemo(() => {
    if (!normalizedDeferredQuery) {
      return options
    }

    return options.filter((option) =>
      normalizeEntityName(
        `${option.label} ${option.searchText ?? ""}`
      ).includes(normalizedDeferredQuery)
    )
  }, [normalizedDeferredQuery, options])

  const actions = useMemo(
    () => (query.trim() ? (getActions?.(query) ?? []) : []),
    [getActions, query]
  )

  const itemCount = filteredOptions.length + actions.length
  const highlightedIndex =
    itemCount === 0 ? -1 : Math.min(Math.max(activeIndex, 0), itemCount - 1)

  const clearSelection = () => {
    preserveQueryOnNextSyncRef.current = Boolean(value)
    setQuery("")
    setActiveIndex(-1)
    setOpen(false)
    onValueChange("")
  }

  const selectOption = (option: ReferenceComboboxOption) => {
    preserveQueryOnNextSyncRef.current = true
    setQuery(option.label)
    setActiveIndex(-1)
    setOpen(false)
    onValueChange(option.value)
  }

  const selectAction = async (action: ReferenceComboboxAction) => {
    setActiveIndex(-1)
    setOpen(false)

    try {
      await action.onSelect()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete that action."
      )
    }
  }

  const handleInputChange = (nextQuery: string) => {
    setQuery(nextQuery)
    setOpen(true)
    setActiveIndex(0)

    if (
      selectedOption &&
      normalizeEntityName(nextQuery) === normalizeEntityName(selectedLabel)
    ) {
      return
    }

    if (value) {
      preserveQueryOnNextSyncRef.current = true
      onValueChange("")
    }
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (!open) setOpen(true)
      if (itemCount === 0) return

      const step = event.key === "ArrowDown" ? 1 : -1
      const edge = event.key === "ArrowDown" ? 0 : itemCount - 1

      setActiveIndex((current) =>
        current < 0
          ? edge
          : Math.min(Math.max(current + step, 0), itemCount - 1)
      )
      return
    }

    if (event.key === "Enter" && open && highlightedIndex >= 0) {
      event.preventDefault()

      if (highlightedIndex < filteredOptions.length) {
        selectOption(filteredOptions[highlightedIndex])
        return
      }

      selectAction(actions[highlightedIndex - filteredOptions.length])
      return
    }

    if (event.key === "Escape" && open) {
      event.preventDefault()
      setActiveIndex(-1)
      setOpen(false)
    }
  }

  return {
    actions,
    clearSelection,
    filteredOptions,
    handleInputChange,
    handleInputKeyDown,
    highlightedIndex,
    open,
    query,
    selectAction,
    selectOption,
    setActiveIndex,
    setOpen,
  }
}
