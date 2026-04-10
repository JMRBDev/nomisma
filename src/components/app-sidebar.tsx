import { Link, useMatchRoute } from "@tanstack/react-router"
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
import { getMainNavItems, getSecondaryNavItems } from "@/lib/dashboard-nav"
import { SidebarUserMenu } from "@/components/sidebar-user-menu"

export function AppSidebar() {
  const session = authClient.useSession()
  const user = session.data?.user
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const matchRoute = useMatchRoute()
  const handleSignOut = useSignOut()
  const mainNavItems = getMainNavItems()
  const secondaryNavItems = getSecondaryNavItems()

  const closeSidebarOnMobile = () => {
    if (!isMobile) return
    setOpenMobile(false)
  }

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
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
                <span className="font-heading text-2xl tracking-tight text-center">
                  {APP_NAME}
                </span>
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
