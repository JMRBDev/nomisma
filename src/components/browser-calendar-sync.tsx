import { useRouter } from "@tanstack/react-router"
import type { BrowserCalendarContext } from "@/lib/browser-calendar"
import {
  detectBrowserCalendarPreferences,
  writeBrowserCalendarCookies,
} from "@/lib/browser-calendar"
import { useMountEffect } from "@/hooks/use-mount-effect"

export function BrowserCalendarSync({
  calendarContext,
}: {
  calendarContext: BrowserCalendarContext
}) {
  const router = useRouter()

  useMountEffect(() => {
    const browserPreferences = detectBrowserCalendarPreferences()
    const cookiesChanged = writeBrowserCalendarCookies(browserPreferences)
    const contextChanged =
      browserPreferences.timeZone !== calendarContext.timeZone ||
      browserPreferences.locale !== calendarContext.locale

    if (cookiesChanged && contextChanged) {
      void router.invalidate()
    }
  })

  return null
}
