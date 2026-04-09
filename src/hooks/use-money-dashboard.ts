import { useQuery } from "@tanstack/react-query"
import {
  getGlobalSearchQueryOptions,
} from "@/lib/dashboard-query-options"
import { useCalendarContext } from "@/hooks/use-calendar-context"

export function useGlobalSearch(query: string) {
  const normalizedQuery = query.trim()
  const calendarContext = useCalendarContext()

  return useQuery({
    ...getGlobalSearchQueryOptions(query, calendarContext),
    gcTime: 30_000,
    enabled: normalizedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
  })
}
