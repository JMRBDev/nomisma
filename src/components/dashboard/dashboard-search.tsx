import { Suspense, lazy, startTransition, useState } from "react"
import { SearchIcon } from "lucide-react"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { Button } from "@/components/ui/button"
import { m } from "@/paraglide/messages"
const loadDashboardSearchDialog = () =>
  import("@/components/dashboard/dashboard-search-dialog")
const LazyDashboardSearchDialog = lazy(async () => ({
  default: (await loadDashboardSearchDialog()).DashboardSearchDialog,
}))

export function DashboardSearch() {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    void loadDashboardSearchDialog()
    startTransition(() => {
      setOpen(true)
    })
  }

  useMountEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() !== "k") return
      event.preventDefault()
      handleOpen()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  })

  return (
    <>
      <Button
        variant="outline"
        className="aspect-square justify-center px-0"
        onClick={handleOpen}
        onFocus={() => {
          void loadDashboardSearchDialog()
        }}
        onPointerEnter={() => {
          void loadDashboardSearchDialog()
        }}
        aria-label={m.search_open_dashboard_search()}
      >
        <SearchIcon className="size-4" />
        <span className="sr-only">{m.search_open_dashboard_search()}</span>
      </Button>

      {open ? (
        <Suspense fallback={null}>
          <LazyDashboardSearchDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      ) : null}
    </>
  )
}
