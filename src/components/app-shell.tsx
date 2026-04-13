import { DashboardHeaderControls } from "./dashboard/dashboard-header-controls"
import { Breadcrumbs } from "./breadcrumbs"
import { Separator } from "./ui/separator"
import type { ReactNode } from "react"
import type { WeekStartsOnPreference } from "@/components/dashboard/settings/settings-shared"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

type AppShellProps = {
  children: ReactNode
  weekStartsOn: WeekStartsOnPreference
}

export function AppShell({ children, weekStartsOn }: AppShellProps) {
  return (
    <SidebarProvider className="overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
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

          <DashboardHeaderControls weekStartsOn={weekStartsOn} />
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
