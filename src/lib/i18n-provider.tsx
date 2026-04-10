import { createContext, type ReactNode } from "react"
import {
  setI18nLocale,
  getI18nLocale,
  m,
  setLocale,
  getLocale,
} from "@/lib/i18n-client"
import type { AppLocale } from "@/lib/i18n"

const I18nContext = createContext<{ locale: AppLocale } | null>(null)

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode
  locale: AppLocale
}) {
  setI18nLocale(locale)
  return (
    <I18nContext.Provider value={{ locale }}>{children}</I18nContext.Provider>
  )
}

export function useI18n() {
  return { m, getLocale: getI18nLocale, setLocale }
}

export { m, getLocale, setLocale }
