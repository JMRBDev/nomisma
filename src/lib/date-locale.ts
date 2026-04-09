import { enUS, es } from "date-fns/locale"
import { getLocale } from "@/paraglide/runtime"

export function getDateFnsLocale() {
  return getLocale() === "es" ? es : enUS
}
