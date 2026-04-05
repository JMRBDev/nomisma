import { Link, useMatchRoute } from "@tanstack/react-router"
import {
  ChevronsUpDownIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  RepeatIcon,
  SettingsIcon,
  TargetIcon,
} from "lucide-react"
import { UserInfoPreview } from "@/components/user-info-preview"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { authClient } from "@/lib/auth-client"
import { handleSignOut } from "@/lib/auth"
import { APP_NAME } from "@/lib/money"

const navItems = [
  {
    exact: true,
    icon: LayoutDashboardIcon,
    label: "Overview",
    to: "/dashboard" as const,
  },
  {
    icon: PiggyBankIcon,
    label: "Accounts",
    to: "/dashboard/accounts" as const,
  },
  {
    icon: ReceiptTextIcon,
    label: "Transactions",
    to: "/dashboard/transactions" as const,
  },
  {
    icon: TargetIcon,
    label: "Budgets",
    to: "/dashboard/budgets" as const,
  },
  {
    icon: RepeatIcon,
    label: "Recurring",
    to: "/dashboard/recurring" as const,
  },
]

const secondaryNavItems = [
  {
    icon: SettingsIcon,
    label: "Settings",
    to: "/dashboard/settings" as const,
  },
]

export function AppSidebar() {
  const session = authClient.useSession()
  const user = session.data?.user
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const matchRoute = useMatchRoute()

  const closeSidebarOnMobile = () => {
    if (!isMobile) return
    setOpenMobile(false)
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                to="/dashboard"
                search={(previous) => previous}
                preload="intent"
                onClick={closeSidebarOnMobile}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LandmarkIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{APP_NAME}</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    Simple money control
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={Boolean(
                      matchRoute({ to: item.to, fuzzy: !item.exact })
                    )}
                  >
                    <Link
                      to={item.to}
                      search={(previous) => previous}
                      preload="intent"
                      onClick={closeSidebarOnMobile}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={Boolean(matchRoute({ to: item.to }))}
                  >
                    <Link
                      to={item.to}
                      search={(previous) => previous}
                      preload="intent"
                      onClick={closeSidebarOnMobile}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <UserInfoPreview user={user} />
                  <ChevronsUpDownIcon className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal text-sidebar-foreground">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfoPreview user={user} />
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
