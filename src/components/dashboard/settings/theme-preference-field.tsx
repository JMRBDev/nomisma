"use client"

import { useTheme } from "next-themes"
import type { ThemePreference } from "@/lib/theme"

import { useIsClient } from "@/hooks/use-is-client"
import { themeOptions } from "@/lib/theme"
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

export function ThemePreferenceField() {
  const isClient = useIsClient()
  const { setTheme, theme } = useTheme()
  const selectedTheme: ThemePreference =
    isClient && isThemePreference(theme) ? theme : "system"

  return (
    <Field>
      <FieldContent>
        <FieldTitle className="font-heading text-lg">Appearance</FieldTitle>
        <FieldDescription>
          Choose this app's theme color. Defaults to system settings.
        </FieldDescription>
      </FieldContent>

      <Select
        value={selectedTheme}
        onValueChange={(value) => setTheme(value)}
        disabled={!isClient}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Choose a theme" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {themeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function isThemePreference(value: string | undefined): value is ThemePreference {
  return themeOptions.some((option) => option.value === value)
}
