export const THEME_STORAGE_KEY = "nomisma-theme"

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

export const COLOR_THEME_STORAGE_KEY = "nomisma-color-theme"

export const colorThemeOptions = [
  {
    value: "zinc",
    label: "Zinc & Rose",
    colors: {
      primary: {
        className: "bg-rose-600",
      },
      secondary: {
        className: "bg-rose-200",
      },
      tertiary: {
        className: "bg-zinc-600",
      },
    },
  },
  {
    value: "olive",
    label: "Pure Olive",
    colors: {
      primary: {
        className: "bg-olive-800",
      },
      secondary: {
        className: "bg-olive-200",
      },
      tertiary: {
        className: "bg-olive-600",
      },
    },
  },
  {
    value: "mist",
    label: "Mist & Emerald",
    colors: {
      primary: {
        className: "bg-emerald-600",
      },
      secondary: {
        className: "bg-emerald-200",
      },
      tertiary: {
        className: "bg-mist-600",
      },
    },
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
