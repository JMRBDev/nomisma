import { useRouter } from "@tanstack/react-router"
import { getLocale } from "@/lib/i18n-client"
import type { BrowserCalendarContext } from "@/lib/browser-calendar"
import {
  detectBrowserCalendarPreferences,
  writeBrowserCalendarCookies,
} from "@/lib/browser-calendar"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { toCalendarLocale } from "@/lib/i18n"

export function BrowserCalendarSync({
  calendarContext,
}: {
  calendarContext: BrowserCalendarContext
}) {
  const router = useRouter()

  useMountEffect(() => {
    const browserPreferences = detectBrowserCalendarPreferences()
    const appLocale = toCalendarLocale(getLocale())
    const cookiesChanged = writeBrowserCalendarCookies({
      timeZone: browserPreferences.timeZone,
      locale: appLocale,
    })
    const contextChanged =
      browserPreferences.timeZone !== calendarContext.timeZone ||
      appLocale !== calendarContext.locale

    if (cookiesChanged && contextChanged) {
      void router.invalidate()
    }
  })

  return null
}
