import {
  LayoutDashboardIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  RepeatIcon,
  SettingsIcon,
  TargetIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type DashboardNavItem = {
  exact?: true
  icon: LucideIcon
  label: string
  searchTerms: string
  to: string
}

export const mainNavItems: Array<DashboardNavItem> = [
  {
    exact: true,
    icon: LayoutDashboardIcon,
    label: "Overview",
    to: "/dashboard",
    searchTerms: "overview dashboard",
  },
  {
    icon: PiggyBankIcon,
    label: "Accounts",
    to: "/dashboard/accounts",
    searchTerms: "accounts balances money places",
  },
  {
    icon: ReceiptTextIcon,
    label: "Transactions",
    to: "/dashboard/transactions",
    searchTerms: "transactions expenses income transfers ledger",
  },
  {
    icon: TargetIcon,
    label: "Budgets",
    to: "/dashboard/budgets",
    searchTerms: "budgets spending limits",
  },
  {
    icon: RepeatIcon,
    label: "Recurring",
    to: "/dashboard/recurring",
    searchTerms: "recurring bills reminders income",
  },
]

export const secondaryNavItems: Array<DashboardNavItem> = [
  {
    icon: SettingsIcon,
    label: "Settings",
    to: "/dashboard/settings",
    searchTerms: "settings currency categories archived accounts",
  },
]
