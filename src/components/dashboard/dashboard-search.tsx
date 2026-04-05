import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  LayoutDashboardIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  RepeatIcon,
  SearchIcon,
  SettingsIcon,
  TargetIcon,
} from "lucide-react"
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
      [
        {
          group: "Pages",
          icon: LayoutDashboardIcon,
          id: "page-overview",
          onSelect: () => {
            void navigate({
              to: "/dashboard",
              search: (previous) => previous,
            })
          },
          title: "Overview",
          value: "overview dashboard",
        },
        {
          group: "Pages",
          icon: PiggyBankIcon,
          id: "page-accounts",
          onSelect: () => {
            void navigate({
              to: "/dashboard/accounts",
              search: (previous) => previous,
            })
          },
          title: "Accounts",
          value: "accounts balances money places",
        },
        {
          group: "Pages",
          icon: ReceiptTextIcon,
          id: "page-transactions",
          onSelect: () => {
            void navigate({
              to: "/dashboard/transactions",
              search: (previous) => previous,
            })
          },
          title: "Transactions",
          value: "transactions expenses income transfers ledger",
        },
        {
          group: "Pages",
          icon: TargetIcon,
          id: "page-budgets",
          onSelect: () => {
            void navigate({
              to: "/dashboard/budgets",
              search: (previous) => previous,
            })
          },
          title: "Budgets",
          value: "budgets spending limits",
        },
        {
          group: "Pages",
          icon: RepeatIcon,
          id: "page-recurring",
          onSelect: () => {
            void navigate({
              to: "/dashboard/recurring",
              search: (previous) => previous,
            })
          },
          title: "Recurring",
          value: "recurring bills reminders income",
        },
        {
          group: "Pages",
          icon: SettingsIcon,
          id: "page-settings",
          onSelect: () => {
            void navigate({
              to: "/dashboard/settings",
              search: (previous) => previous,
            })
          },
          title: "Settings",
          value: "settings currency categories archived accounts",
        },
      ].filter(
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
