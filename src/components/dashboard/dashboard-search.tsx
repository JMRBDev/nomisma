import { useDeferredValue, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { SearchIcon } from "lucide-react"
import type { SearchItem } from "@/components/dashboard/dashboard-search-shared"
import {
  buildEntitySearchItems,
  buildPageSearchItems,
} from "@/components/dashboard/dashboard-search-shared"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { useGlobalSearch } from "@/hooks/use-money-dashboard"
import { Button } from "@/components/ui/button"
import { m } from "@/paraglide/messages"
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

export function DashboardSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const normalizedQuery = query.trim().toLowerCase()
  const deferredQuery = useDeferredValue(query)
  const deferredNormalizedQuery = deferredQuery.trim().toLowerCase()
  const { data: searchResults, isFetching } = useGlobalSearch(deferredQuery)

  useMountEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() !== "k") return
      event.preventDefault()
      setOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  })

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
    ? m.search_empty_idle()
    : deferredNormalizedQuery !== normalizedQuery || isFetching
      ? m.search_searching()
      : m.search_empty_results()

  return (
    <>
      <Button
        variant="outline"
        className="aspect-square justify-center px-0"
        onClick={() => setOpen(true)}
        aria-label={m.search_open_dashboard_search()}
      >
        <SearchIcon className="size-4" />
        <span className="sr-only">{m.search_open_dashboard_search()}</span>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setQuery("")
          }
        }}
        title={m.search_title()}
        description={m.search_description()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={m.search_placeholder()}
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
                        setOpen(false)
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
    </>
  )
}
