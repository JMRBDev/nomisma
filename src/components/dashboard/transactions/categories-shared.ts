import {
  BadgeDollarSignIcon,
  BriefcaseBusinessIcon,
  CarFrontIcon,
  HouseIcon,
  ShoppingCartIcon,
  UtensilsCrossedIcon,
} from "lucide-react"
import { getRouteApi } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import type { IconOption } from "@/components/icon-picker"
import { COLOR_OPTIONS } from "@/components/picker-shared"
import { pickRandomItem } from "@/lib/random"

const transactionsRouteApi = getRouteApi(
  "/_authenticated/dashboard/transactions"
)

type TransactionsData = ReturnType<typeof transactionsRouteApi.useLoaderData>

export type CategoryRecord = TransactionsData["categories"]["all"][number]

export type CategoryFormValues = {
  name: string
  kind: "income" | "expense"
  color: string
  icon: string
}

export type CategoryFieldErrors = Partial<
  Record<"name" | "color" | "icon", string>
>

export const CATEGORY_ICON_OPTIONS: Array<IconOption> = [
  { name: "shopping-cart", label: "Shopping", icon: ShoppingCartIcon },
  { name: "utensils-crossed", label: "Food", icon: UtensilsCrossedIcon },
  { name: "house", label: "Home", icon: HouseIcon },
  { name: "car-front", label: "Transport", icon: CarFrontIcon },
  { name: "briefcase-business", label: "Work", icon: BriefcaseBusinessIcon },
  { name: "badge-dollar-sign", label: "Income", icon: BadgeDollarSignIcon },
]

export const CATEGORY_ICON_MAP = CATEGORY_ICON_OPTIONS.reduce<
  Record<string, LucideIcon>
>((map, option) => {
  map[option.name] = option.icon
  return map
}, {})

export function createRandomCategoryAppearance() {
  return {
    color: pickRandomItem(COLOR_OPTIONS).value,
    icon: pickRandomItem(CATEGORY_ICON_OPTIONS).name,
  }
}

export function resolveCategoryAppearance(values: {
  color?: string | null
  icon?: string | null
}) {
  const defaults = createRandomCategoryAppearance()

  return {
    color: values.color?.trim() || defaults.color,
    icon: values.icon?.trim() || defaults.icon,
  }
}

export function createDefaultCategoryValues(): CategoryFormValues {
  return {
    name: "",
    kind: "expense",
    ...createRandomCategoryAppearance(),
  }
}

export function validateCategoryValues(
  values: CategoryFormValues
): CategoryFieldErrors {
  const errors: CategoryFieldErrors = {}

  if (!values.name.trim()) {
    errors.name = "Category name is required."
  }

  if (!values.color.trim()) {
    errors.color = "Category color is required."
  }

  if (!values.icon.trim()) {
    errors.icon = "Category icon is required."
  }

  return errors
}

export function buildCategoryPayload(values: CategoryFormValues) {
  const appearance = resolveCategoryAppearance(values)

  return {
    name: values.name.trim(),
    kind: values.kind,
    color: appearance.color,
    icon: appearance.icon,
  }
}
