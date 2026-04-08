import { getRouteApi } from "@tanstack/react-router"

const overviewRouteApi = getRouteApi("/_authenticated/dashboard/")

export type OverviewData = ReturnType<typeof overviewRouteApi.useLoaderData>

export type OverviewAlertRecord = OverviewData["overview"]["alerts"][number]
export type OverviewTopSpendingCategory =
  OverviewData["overview"]["topSpendingCategories"][number]
