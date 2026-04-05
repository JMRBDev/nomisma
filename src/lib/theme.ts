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
