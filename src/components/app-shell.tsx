import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "./ui/separator"
import { Breadcrumbs } from "./breadcrumbs"
import { DashboardSearch } from "./dashboard/dashboard-search"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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
            <DashboardSearch />
          </div>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
