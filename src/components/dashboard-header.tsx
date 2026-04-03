import { Breadcrumbs } from "@/components/breadcrumbs"
import { GlobalDashboardSearch } from "@/components/global-dashboard-search"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 flex-row items-center justify-between gap-2 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 hidden data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center md:block"
        />
        <div className="hidden md:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2 md:ml-auto">
        <GlobalDashboardSearch />
      </div>
    </header>
  )
}
