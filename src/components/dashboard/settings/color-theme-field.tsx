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

      <div className="flex gap-2 items-center">
        {colorThemeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleChange(option.value)}
            className={cn("flex items-stretch size-16 aspect-square rounded-2xl border border-border overflow-hidden divide-x divide-border", {
              "ring-2 ring-ring ring-offset-0.5": option.value === colorTheme
            })}
          >
            <div className={cn("flex-1", option.colors.primary.className)} />
            <div className="flex flex-col flex-1 divide-y divide-border">
              <div className={cn("flex-1", option.colors.secondary.className)} />

              <div className={cn("flex-1", option.colors.tertiary.className)} />
            </div>
          </button>
        ))}
      </div>
    </Field>
  )
}
