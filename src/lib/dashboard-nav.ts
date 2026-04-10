import {
  LayoutDashboardIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  RepeatIcon,
  SettingsIcon,
  TargetIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { m } from "@/lib/i18n-client"

type DashboardNavItem = {
  exact?: true
  icon: LucideIcon
  label: string
  searchTerms: string
  to: string
}

export function getMainNavItems(): Array<DashboardNavItem> {
  return [
    {
      exact: true,
      icon: LayoutDashboardIcon,
      label: m.nav_overview(),
      to: "/dashboard",
      searchTerms: "overview dashboard resumen panel",
    },
    {
      icon: PiggyBankIcon,
      label: m.nav_accounts(),
      to: "/dashboard/accounts",
      searchTerms: "accounts balances money places cuentas saldos dinero",
    },
    {
      icon: ReceiptTextIcon,
      label: m.nav_transactions(),
      to: "/dashboard/transactions",
      searchTerms:
        "transactions expenses income transfers ledger transacciones gastos ingresos transferencias",
    },
    {
      icon: TargetIcon,
      label: m.nav_budgets(),
      to: "/dashboard/budgets",
      searchTerms: "budgets spending limits presupuestos presupuesto limites",
    },
    {
      icon: RepeatIcon,
      label: m.nav_recurring(),
      to: "/dashboard/recurring",
      searchTerms:
        "recurring bills reminders income recurrente facturas recordatorios",
    },
  ]
}

export function getSecondaryNavItems(): Array<DashboardNavItem> {
  return [
    {
      icon: SettingsIcon,
      label: m.nav_settings(),
      to: "/dashboard/settings",
      searchTerms:
        "settings currency categories archived accounts configuracion ajustes",
    },
  ]
}
