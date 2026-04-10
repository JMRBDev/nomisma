/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import * as React from "react"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, getRequestHeaders } from "@tanstack/react-start/server"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import type { ConvexQueryClient } from "@convex-dev/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { BrowserCalendarSync } from "@/components/browser-calendar-sync"
import { authClient } from "@/lib/auth-client"
import { getToken } from "@/lib/auth-server"
import { resolveRequestLocale, setRequestLocale } from "@/lib/i18n-server"
import { I18nProvider } from "@/lib/i18n-provider"
import {
  BROWSER_TIME_ZONE_COOKIE_NAME,
  getBrowserCalendarBootstrapScript,
  resolveBrowserCalendarContext,
} from "@/lib/browser-calendar"
import { buildLocaleCookieValue, t, toCalendarLocale } from "@/lib/i18n"
import { APP_NAME } from "@/lib/money"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

import appCss from "@/styles/globals.css?url"

const getRequestState = createServerFn({ method: "GET" }).handler(async () => {
  const token = await getToken()
  const locale = resolveRequestLocale(
    new Request("http://nomisma.local", {
      headers: getRequestHeaders(),
    }),
  )

  setRequestLocale(locale)
  const calendarContext = resolveBrowserCalendarContext({
    timeZone: getCookie(BROWSER_TIME_ZONE_COOKIE_NAME),
    locale: toCalendarLocale(locale),
  })

  return {
    locale,
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
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#ffffff", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
      { title: APP_NAME },
      { name: "description", content: t("app_description") },
    ],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "icon", href: "/favicon.ico" }],
  }),
  beforeLoad: async (ctx) => {
    const { token, locale, calendarContext } = await getRequestState()

    if (token) {
      ctx.context.convexQueryClient.convexClient.setAuth(() => Promise.resolve(token))
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    return { isAuthenticated: !!token, locale, token, calendarContext }
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
      <I18nProvider locale={context.locale}>
        <RootDocument>
          <BrowserCalendarSync calendarContext={context.calendarContext} />
          <Outlet />
        </RootDocument>
      </I18nProvider>
    </ConvexBetterAuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale } = Route.useRouteContext()

  return (
    <html lang={locale} className="bg-sidebar" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.setAttribute('data-color-theme',localStorage.getItem('nomisma-color-theme')||'zinc')}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.lang=${JSON.stringify(locale)};document.cookie=${JSON.stringify(buildLocaleCookieValue(locale))}`,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: getBrowserCalendarBootstrapScript() }} />
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
