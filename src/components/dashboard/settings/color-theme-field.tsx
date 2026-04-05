"use client"

import { useState } from "react"

import type { ColorTheme } from "@/lib/theme"
import { useIsClient } from "@/hooks/use-is-client"
import { colorThemeOptions, getColorTheme, setColorTheme } from "@/lib/theme"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function ColorThemeField() {
  const isClient = useIsClient()
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

      <Select
        value={colorTheme}
        onValueChange={handleChange}
        disabled={!isClient}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Choose a color" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {colorThemeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <span
                    className={cn("inline-block size-3 shrink-0 rounded-full", option.className)}
                  />
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
