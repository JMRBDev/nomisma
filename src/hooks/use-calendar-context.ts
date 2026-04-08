import { getRouteApi } from "@tanstack/react-router"

const rootRouteApi = getRouteApi("__root__")

export function useCalendarContext() {
  const { calendarContext } = rootRouteApi.useRouteContext()

  return calendarContext
}
