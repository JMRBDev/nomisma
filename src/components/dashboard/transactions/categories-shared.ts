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
import type { IconOption } from "@/components/picker-shared"
import { COLOR_OPTIONS } from "@/components/picker-shared"
import { pickRandomItem } from "@/lib/random"
import { m } from "@/paraglide/messages"

const transactionsRouteApi = getRouteApi(
  "/_authenticated/dashboard/transactions"
)

type TransactionsData = ReturnType<typeof transactionsRouteApi.useLoaderData>

export type CategoryRecord = TransactionsData["categories"]["all"][number]

export type CategoryFormValues = {
  name: string
  color: string
  icon: string
}

export type CategoryFieldErrors = Partial<
  Record<"name" | "color" | "icon", string>
>

export const CATEGORY_ICON_OPTIONS: Array<IconOption> = [
  {
    name: "shopping-cart",
    label: m.categories_icon_shopping(),
    icon: ShoppingCartIcon,
  },
  {
    name: "utensils-crossed",
    label: m.categories_icon_food(),
    icon: UtensilsCrossedIcon,
  },
  { name: "house", label: m.categories_icon_home(), icon: HouseIcon },
  {
    name: "car-front",
    label: m.categories_icon_transport(),
    icon: CarFrontIcon,
  },
  {
    name: "briefcase-business",
    label: m.categories_icon_work(),
    icon: BriefcaseBusinessIcon,
  },
  {
    name: "badge-dollar-sign",
    label: m.categories_icon_income(),
    icon: BadgeDollarSignIcon,
  },
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
    ...createRandomCategoryAppearance(),
  }
}

export function validateCategoryValues(
  values: CategoryFormValues
): CategoryFieldErrors {
  const errors: CategoryFieldErrors = {}

  if (!values.name.trim()) {
    errors.name = m.categories_error_name_required()
  }

  if (!values.color.trim()) {
    errors.color = m.categories_error_color_required()
  }

  if (!values.icon.trim()) {
    errors.icon = m.categories_error_icon_required()
  }

  return errors
}

export function buildCategoryPayload(values: CategoryFormValues) {
  const appearance = resolveCategoryAppearance(values)

  return {
    name: values.name.trim(),
    color: appearance.color,
    icon: appearance.icon,
  }
}
