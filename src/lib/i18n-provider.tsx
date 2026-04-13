import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import type { AppLocale } from "@/lib/i18n-locale"
import {
  createTranslator,
  getLocale,
  setLocale,
  syncLocale,
  t,
} from "@/lib/i18n-runtime"

const I18nContext = createContext<{
  locale: AppLocale
  t: ReturnType<typeof createTranslator>
} | null>(null)

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode
  locale: AppLocale
}) {
  syncLocale(locale)

  return (
    <I18nContext.Provider value={{ locale, t: createTranslator(locale) }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }

  return {
    locale: context.locale,
    t: context.t,
    getLocale,
    setLocale,
  }
}

export { getLocale, setLocale, t }
