import { useState } from "react"

import type { ColorTheme } from "@/lib/theme"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { t } from "@/lib/i18n"
import {
  DEFAULT_COLOR_THEME,
  getColorTheme,
  getColorThemeOptions,
  setColorTheme,
} from "@/lib/theme"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

export function ColorThemeField() {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(
    DEFAULT_COLOR_THEME
  )
  const colorThemeOptions = getColorThemeOptions()

  useMountEffect(() => {
    setColorThemeState(getColorTheme())
  })

  function handleChange(value: string) {
    const theme = value as ColorTheme
    setColorTheme(theme)
    setColorThemeState(theme)
  }

  return (
    <Field>
      <FieldContent>
        <FieldTitle className="font-heading text-lg">
          {t("settings_color_theme_title")}
        </FieldTitle>
        <FieldDescription>
          {t("settings_color_theme_description")}
        </FieldDescription>
      </FieldContent>

      <div className="flex items-center gap-2">
        {colorThemeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleChange(option.value)}
            className={cn(
              "flex aspect-square size-16 items-stretch divide-x divide-border overflow-hidden rounded-2xl border border-border",
              {
                "ring-offset-0.5 ring-2 ring-ring": option.value === colorTheme,
              }
            )}
          >
            <div className={cn("flex-1", option.colors.primary.className)} />
            <div className="flex flex-1 flex-col divide-y divide-border">
              <div
                className={cn("flex-1", option.colors.secondary.className)}
              />

              <div className={cn("flex-1", option.colors.tertiary.className)} />
            </div>
          </button>
        ))}
      </div>
    </Field>
  )
}
