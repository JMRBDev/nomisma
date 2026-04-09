import { m } from "@/paraglide/messages"

export const THEME_STORAGE_KEY = "nomisma-theme"

export const themeValues = ["system", "light", "dark"] as const

export type ThemePreference = (typeof themeValues)[number]

export const COLOR_THEME_STORAGE_KEY = "nomisma-color-theme"

const colorThemeDefinitions = [
  {
    value: "zinc",
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

export type ColorTheme = (typeof colorThemeDefinitions)[number]["value"]

export const DEFAULT_COLOR_THEME: ColorTheme = "zinc"

export function isValidColorTheme(value: string): value is ColorTheme {
  return colorThemeDefinitions.some((option) => option.value === value)
}

export function getThemeOptions() {
  return [
    { value: "system", label: m.theme_system() },
    { value: "light", label: m.theme_light() },
    { value: "dark", label: m.theme_dark() },
  ] as const
}

export function getColorThemeOptions() {
  return colorThemeDefinitions.map((option) => ({
    ...option,
    label: getColorThemeLabel(option.value),
  }))
}

export function getColorThemeLabel(value: ColorTheme) {
  switch (value) {
    case "olive":
      return m.color_theme_olive()
    case "mist":
      return m.color_theme_mist()
    default:
      return m.color_theme_zinc()
  }
}

function applyColorTheme(theme: ColorTheme) {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.setAttribute("data-color-theme", theme)
}

export function getColorTheme(): ColorTheme {
  if (typeof localStorage === "undefined") {
    return DEFAULT_COLOR_THEME
  }

  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY)
  return stored && isValidColorTheme(stored) ? stored : DEFAULT_COLOR_THEME
}

export function setColorTheme(theme: ColorTheme) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme)
  }

  applyColorTheme(theme)
}
