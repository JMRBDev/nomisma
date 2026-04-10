import { useDeferredValue, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import type { SearchItem } from "@/components/dashboard/dashboard-search-shared"
import {
  buildEntitySearchItems,
  buildPageSearchItems,
} from "@/components/dashboard/dashboard-search-shared"
import { useGlobalSearch } from "@/hooks/use-money-dashboard"
import { t } from "@/lib/i18n"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

function contains(value: string, query: string) {
  return value.toLowerCase().includes(query)
}

export function DashboardSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const normalizedQuery = query.trim().toLowerCase()
  const deferredQuery = useDeferredValue(query)
  const deferredNormalizedQuery = deferredQuery.trim().toLowerCase()
  const { data: searchResults, isFetching } = useGlobalSearch(deferredQuery)

  const items = useMemo<Array<SearchItem>>(
    () => [
      ...buildPageSearchItems(navigate).filter(
        (item) => !normalizedQuery || contains(item.value, normalizedQuery)
      ),
      ...(searchResults
        ? buildEntitySearchItems(navigate, searchResults)
        : []),
    ],
    [navigate, normalizedQuery, searchResults]
  )

  const grouped = useMemo(() => {
    const byGroup = new Map<string, Array<SearchItem>>()

    for (const item of items) {
      const current = byGroup.get(item.group) ?? []
      current.push(item)
      byGroup.set(item.group, current)
    }

    return [...byGroup.entries()]
  }, [items])

  const emptyLabel = !normalizedQuery
    ? t("search_empty_idle")
    : deferredNormalizedQuery !== normalizedQuery || isFetching
      ? t("search_searching")
      : t("search_empty_results")

  return (
    <CommandDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setQuery("")
        }
      }}
      title={t("search_title")}
      description={t("search_description")}
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t("search_placeholder")}
        />
        <CommandList>
          <CommandEmpty>{emptyLabel}</CommandEmpty>
          {grouped.map(([group, groupItems], index) => (
            <div key={group}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group}>
                {groupItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.value}
                    onSelect={() => {
                      onOpenChange(false)
                      item.onSelect()
                    }}
                  >
                    <item.icon className="size-4" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{item.title}</div>
                      {item.subtitle ? (
                        <div className="text-muted-foreground truncate text-xs">
                          {item.subtitle}
                        </div>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
