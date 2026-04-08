/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import * as React from "react"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, getRequestHeader } from "@tanstack/react-start/server"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import type { ConvexQueryClient } from "@convex-dev/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { BrowserCalendarSync } from "@/components/browser-calendar-sync"
import { authClient } from "@/lib/auth-client"
import { getToken } from "@/lib/auth-server"
import {
  BROWSER_LOCALE_COOKIE_NAME,
  BROWSER_TIME_ZONE_COOKIE_NAME,
  getBrowserCalendarBootstrapScript,
  resolveBrowserCalendarContext,
} from "@/lib/browser-calendar"
import { APP_NAME } from "@/lib/money"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

import appCss from "@/styles/globals.css?url"

const getRequestState = createServerFn({ method: "GET" }).handler(async () => {
  const token = await getToken()
  const calendarContext = resolveBrowserCalendarContext({
    timeZone: getCookie(BROWSER_TIME_ZONE_COOKIE_NAME),
    locale:
      getCookie(BROWSER_LOCALE_COOKIE_NAME) ??
      getRequestHeader("accept-language"),
  })

  return {
    token,
    calendarContext,
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "theme-color",
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#0a0a0a",
        media: "(prefers-color-scheme: dark)",
      },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Personal finance tracker with accounts, transactions, budgets, and recurring reminders.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  beforeLoad: async (ctx) => {
    const { token, calendarContext } = await getRequestState()

    if (token) {
      ctx.context.convexQueryClient.convexClient.setAuth(() =>
        Promise.resolve(token)
      )
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    return {
      isAuthenticated: !!token,
      token,
      calendarContext,
    }
  },
  component: RootComponent,
})

function RootComponent() {
  const context = Route.useRouteContext()

  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      <RootDocument>
        <BrowserCalendarSync calendarContext={context.calendarContext} />
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-sidebar" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.setAttribute('data-color-theme',localStorage.getItem('nomisma-color-theme')||'zinc')}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getBrowserCalendarBootstrapScript(),
          }}
        />
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
