import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import type { AppLocale } from "@/lib/i18n"
import { getLocale, setLocale, t } from "@/lib/i18n"
import { getLocaleOptions } from "@/components/dashboard/settings/settings-shared"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field"
import { SettingsSelect } from "@/components/dashboard/settings/settings-select"

export function LanguageField() {
  const router = useRouter()
  const localeOptions = getLocaleOptions()
  const [locale, setLocaleState] = useState(getLocale())
  const [pending, setPending] = useState(false)

  async function handleLocaleChange(value: string) {
    if (pending) {
      return
    }

    const nextLocale = value as AppLocale

    setLocaleState(nextLocale)
    setPending(true)

    try {
      await setLocale(nextLocale, { reload: false })
      await router.invalidate()
    } finally {
      setPending(false)
    }
  }

  return (
    <Field>
      <FieldContent>
        <FieldTitle className="font-heading text-lg">
          {t("settings_language_title")}
        </FieldTitle>
        <FieldDescription>
          {t("settings_language_description")}
        </FieldDescription>
      </FieldContent>

      <SettingsSelect
        value={locale}
        onValueChange={handleLocaleChange}
        options={localeOptions}
        placeholder={t("settings_choose_language")}
      />
    </Field>
  )
}
