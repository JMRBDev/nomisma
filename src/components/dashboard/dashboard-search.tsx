import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { SearchIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { Button } from "@/components/ui/button"
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
import { mainNavItems, secondaryNavItems } from "@/lib/dashboard-nav"

type SearchItem = {
  group: string
  icon: LucideIcon
  id: string
  onSelect: () => void
  title: string
  value: string
}

function contains(value: string, query: string) {
  return value.toLowerCase().includes(query)
}

function buildSearchItems(navigate: ReturnType<typeof useNavigate>) {
  return [...mainNavItems, ...secondaryNavItems].map((item) => ({
    group: "Pages",
    icon: item.icon,
    id: `page-${item.label.toLowerCase()}`,
    onSelect: () => {
      void navigate({
        to: item.to,
        search: (previous) => previous,
      })
    },
    title: item.label,
    value: item.searchTerms,
  }))
}

export function DashboardSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const normalizedQuery = query.trim().toLowerCase()

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
    () =>
      buildSearchItems(navigate).filter(
        (item) => !normalizedQuery || contains(item.value, normalizedQuery)
      ),
    [navigate, normalizedQuery]
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

  return (
    <>
      <Button
        variant="outline"
        className="aspect-square justify-center px-0"
        onClick={() => setOpen(true)}
        aria-label="Open dashboard search"
      >
        <SearchIcon className="size-4" />
        <span className="sr-only">Open dashboard search</span>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Dashboard search"
        description="Search the available dashboard pages."
      >
        <Command shouldFilter>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search overview, budgets, recurring..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
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
                      <span>{item.title}</span>
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
