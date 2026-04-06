import { Link, useMatchRoute } from "@tanstack/react-router"
import { LandmarkIcon } from "lucide-react"
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
import { useSignOut } from "@/lib/auth"
import { APP_NAME } from "@/lib/money"
import { mainNavItems, secondaryNavItems } from "@/lib/dashboard-nav"
import { SidebarUserMenu } from "@/components/sidebar-user-menu"

export function AppSidebar() {
  const session = authClient.useSession()
  const user = session.data?.user
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const matchRoute = useMatchRoute()
  const handleSignOut = useSignOut()

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
              {mainNavItems.map((item) => (
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
        <SidebarUserMenu
          user={user}
          isMobile={isMobile}
          onSignOut={handleSignOut}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
