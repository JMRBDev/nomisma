import { enUS, es } from "date-fns/locale"
import { getLocale } from "@/lib/i18n"

export function getDateFnsLocale() {
  return getLocale() === "es" ? es : enUS
}
