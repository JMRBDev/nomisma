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
  {
    value: "zinc",
    label: "Zinc & Rose",
    className: "bg-rose-600",
  },
  {
    value: "olive",
    label: "Pure Olive",
    className: "bg-olive-600",
  },
  {
    value: "mist",
    label: "Mist & Emerald",
    className: "bg-emerald-600",
  },
] as const

export type ColorTheme = (typeof colorThemeOptions)[number]["value"]

export const DEFAULT_COLOR_THEME: ColorTheme = "zinc"

export function isValidColorTheme(value: string): value is ColorTheme {
  return colorThemeOptions.some((option) => option.value === value)
}

function applyColorTheme(theme: ColorTheme) {
  document.documentElement.setAttribute("data-color-theme", theme)
}

export function getColorTheme(): ColorTheme {
  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY)
  return stored && isValidColorTheme(stored) ? stored : DEFAULT_COLOR_THEME
}

export function setColorTheme(theme: ColorTheme) {
  localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme)
  applyColorTheme(theme)
}
