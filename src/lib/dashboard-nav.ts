import {
  LayoutDashboardIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  RepeatIcon,
  SettingsIcon,
  TargetIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { t } from "@/lib/i18n"

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
      label: t("nav_overview"),
      to: "/dashboard",
      searchTerms: "overview dashboard resumen panel",
    },
    {
      icon: PiggyBankIcon,
      label: t("nav_accounts"),
      to: "/dashboard/accounts",
      searchTerms: "accounts balances money places cuentas saldos dinero",
    },
    {
      icon: ReceiptTextIcon,
      label: t("nav_transactions"),
      to: "/dashboard/transactions",
      searchTerms:
        "transactions expenses income transfers ledger transacciones gastos ingresos transferencias",
    },
    {
      icon: TargetIcon,
      label: t("nav_budgets"),
      to: "/dashboard/budgets",
      searchTerms: "budgets spending limits presupuestos presupuesto limites",
    },
    {
      icon: RepeatIcon,
      label: t("nav_recurring"),
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
      label: t("nav_settings"),
      to: "/dashboard/settings",
      searchTerms:
        "settings currency categories archived accounts configuracion ajustes",
    },
  ]
}
