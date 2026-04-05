import { Fragment } from "react"
import { Link, useMatches } from "@tanstack/react-router"
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
              label,
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
