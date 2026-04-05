export const THEME_STORAGE_KEY = "money-app-theme"

export const themeOptions = [
  {
    value: "system",
    label: "System",
  },
  {
    value: "light",
    label: "Light",
  },
  {
    value: "dark",
    label: "Dark",
  },
] as const

export type ThemePreference = (typeof themeOptions)[number]["value"]

export const COLOR_THEME_STORAGE_KEY = "money-app-color-theme"

export const colorThemeOptions = [
  { value: "red", label: "Red", swatch: "oklch(0.514 0.222 16.935)" },
  { value: "amber", label: "Amber", swatch: "oklch(0.62 0.17 65)" },
  { value: "green", label: "Green", swatch: "oklch(0.55 0.17 155)" },
  { value: "blue", label: "Blue", swatch: "oklch(0.5 0.2 250)" },
  { value: "violet", label: "Violet", swatch: "oklch(0.5 0.2 300)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.55 0.22 350)" },
] as const

export type ColorTheme = (typeof colorThemeOptions)[number]["value"]

export const DEFAULT_COLOR_THEME: ColorTheme = "red"

export function isValidColorTheme(value: string): value is ColorTheme {
  return colorThemeOptions.some((option) => option.value === value)
}

function applyColorTheme(theme: ColorTheme) {
  const root = document.documentElement
  if (theme === DEFAULT_COLOR_THEME) {
    root.removeAttribute("data-color-theme")
  } else {
    root.setAttribute("data-color-theme", theme)
  }
}

export function getColorTheme(): ColorTheme {
  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY)
  return stored && isValidColorTheme(stored) ? stored : DEFAULT_COLOR_THEME
}

export function setColorTheme(theme: ColorTheme) {
  localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme)
  applyColorTheme(theme)
}
