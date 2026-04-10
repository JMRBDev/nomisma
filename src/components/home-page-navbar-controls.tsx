import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import type { AppLocale } from "@/lib/i18n"
import { setLocale, t } from "@/lib/i18n"
import { useIsClient } from "@/hooks/use-is-client"
import { getLocaleOptions } from "@/components/dashboard/settings/settings-shared"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function HomePageNavbarControls({
  locale: initialLocale,
}: {
  locale: AppLocale
}) {
  const router = useRouter()
  const isClient = useIsClient()
  const { resolvedTheme, setTheme } = useTheme()
  const localeOptions = getLocaleOptions()
  const [locale, setLocaleState] = useState(initialLocale)
  const [localePending, setLocalePending] = useState(false)
  const activeTheme = isClient ? resolvedTheme : undefined
  const isDarkTheme = activeTheme === "dark"

  async function handleLocaleChange(value: string) {
    const nextLocale = value as AppLocale

    setLocaleState(nextLocale)
    setLocalePending(true)

    try {
      setLocale(nextLocale, { reload: false })
      await router.invalidate()
    } finally {
      setLocalePending(false)
    }
  }

  function handleThemeToggle() {
    setTheme(isDarkTheme ? "light" : "dark")
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={locale}
        onValueChange={handleLocaleChange}
        disabled={localePending}
      >
        <SelectTrigger
          aria-label={t("settings_language_title")}
        >
          <SelectValue placeholder={t("settings_choose_language")} />
        </SelectTrigger>

        <SelectContent position="popper">
          <SelectGroup>
            {localeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={handleThemeToggle}
        disabled={!isClient}
        aria-label={isDarkTheme ? t("theme_light") : t("theme_dark")}
        title={isDarkTheme ? t("theme_light") : t("theme_dark")}
      >
        {isDarkTheme ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  )
}
