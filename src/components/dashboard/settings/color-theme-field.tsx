import { useState } from "react"

import type { ColorTheme } from "@/lib/theme"
import { colorThemeOptions, getColorTheme, setColorTheme } from "@/lib/theme"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

export function ColorThemeField() {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(getColorTheme)

  function handleChange(value: string) {
    const theme = value as ColorTheme
    setColorTheme(theme)
    setColorThemeState(theme)
  }

  return (
    <Field>
      <FieldContent>
        <FieldTitle className="font-heading text-lg">Color Theme</FieldTitle>
        <FieldDescription>
          Choose the accent color used throughout the app.
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
