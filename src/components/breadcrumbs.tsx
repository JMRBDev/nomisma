import { Fragment } from "react"
import { Link, useMatches } from "@tanstack/react-router"
import { m } from "@/lib/i18n-client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type BreadcrumbStaticData = {
  breadcrumb?: string
}

type BreadcrumbItemData = {
  label: string
  pathname: string
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")
}

function getFallbackLabel(routeId: string) {
  const segment = routeId.split("/").filter(Boolean).pop()
  if (!segment) return null

  const normalized = segment
    .replace(/^_+/, "")
    .replace(/\$/g, "")
    .replace(/[-_]+/g, " ")
    .trim()

  if (!normalized) return null
  return toTitleCase(normalized)
}

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "")
  return normalized || "/"
}

function translateBreadcrumb(routeId: string, label: string) {
  switch (routeId) {
    case "/_authenticated/dashboard":
    case "/_authenticated/dashboard/":
      return m.nav_overview()
    case "/_authenticated/dashboard/accounts":
      return m.nav_accounts()
    case "/_authenticated/dashboard/transactions":
      return m.nav_transactions()
    case "/_authenticated/dashboard/budgets":
      return m.nav_budgets()
    case "/_authenticated/dashboard/recurring":
      return m.nav_recurring()
    case "/_authenticated/dashboard/settings":
      return m.nav_settings()
    default:
      return label
  }
}

export function dedupeBreadcrumbItems(items: Array<BreadcrumbItemData>) {
  return items.filter((item, index) => {
    const previous = items[index - 1]
    if (index === 0) return true

    return !(
      item.label === previous.label &&
      normalizePathname(item.pathname) === normalizePathname(previous.pathname)
    )
  })
}

export function Breadcrumbs() {
  const breadcrumbItems = useMatches({
    select: (matches) =>
      dedupeBreadcrumbItems(
        matches
          .filter((match) => match.routeId !== "__root__")
          .map((match) => {
            const staticData = match.staticData as
              | BreadcrumbStaticData
              | undefined
            const label =
              staticData?.breadcrumb ?? getFallbackLabel(match.routeId)

            if (!label) return null
            if (match.fullPath === "/" && !staticData?.breadcrumb) return null

            return {
              label: translateBreadcrumb(match.routeId, label),
              pathname: match.pathname,
            }
          })
          .filter((item): item is BreadcrumbItemData => item !== null)
      ),
  })

  if (!breadcrumbItems.length) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1

          return (
            <Fragment key={`${item.pathname}-${item.label}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.pathname} search={(previous) => previous}>
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {isLast ? null : <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
