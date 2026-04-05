import type { useOverviewData } from "@/hooks/use-money-dashboard"

type OverviewData = NonNullable<ReturnType<typeof useOverviewData>["data"]>

export type OverviewAlertRecord = OverviewData["overview"]["alerts"][number]
export type OverviewTopSpendingCategory =
  OverviewData["overview"]["topSpendingCategories"][number]
export type OverviewRecentTransactionRecord =
  OverviewData["overview"]["recentTransactions"][number]
export type OverviewUpcomingRecurringRecord =
  OverviewData["overview"]["upcomingRecurring"][number]
export type OverviewOnboardingStep = OverviewData["onboarding"]["steps"][number]
