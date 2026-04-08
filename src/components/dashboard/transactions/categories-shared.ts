import {
  BadgeDollarSignIcon,
  BriefcaseBusinessIcon,
  CarFrontIcon,
  HouseIcon,
  ShoppingCartIcon,
  UtensilsCrossedIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { IconOption } from "@/components/icon-picker"
import type { useTransactionsPageData } from "@/hooks/use-money-dashboard"

type TransactionsData = NonNullable<
  ReturnType<typeof useTransactionsPageData>["data"]
>

export type CategoryRecord = TransactionsData["categories"]["all"][number]

export type CategoryFormValues = {
  name: string
  kind: "income" | "expense"
  color: string
  icon: string
}

export type CategoryFieldErrors = Partial<Record<"name", string>>

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

export const DEFAULT_CATEGORY_VALUES: CategoryFormValues = {
  name: "",
  kind: "expense",
  color: "",
  icon: "",
}

export function validateCategoryValues(
  values: CategoryFormValues
): CategoryFieldErrors {
  const errors: CategoryFieldErrors = {}

  if (!values.name.trim()) {
    errors.name = "Category name is required."
  }

  return errors
}

export function buildCategoryPayload(values: CategoryFormValues) {
  return {
    name: values.name.trim(),
    kind: values.kind,
    color: values.color.trim() || undefined,
    icon: values.icon.trim() || undefined,
  }
}
