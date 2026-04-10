import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const rootDir = process.cwd()
const messagesDir = path.join(rootDir, "i18n")
const outputFile = path.join(
  rootDir,
  "src",
  "lib",
  "i18n-types.generated.ts"
)

function sortEntries(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
  )
}

async function buildLocale(locale) {
  const localeDir = path.join(messagesDir, locale)
  const files = (await readdir(localeDir))
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right))

  const entries = {}

  for (const file of files) {
    const namespace = file.slice(0, -".json".length)
    const raw = await readFile(path.join(localeDir, file), "utf8")
    const messages = JSON.parse(raw)

    for (const [key, value] of Object.entries(messages)) {
      const flattenedKey = `${namespace}_${key}`

      if (typeof value !== "string") {
        throw new Error(
          `Message "${flattenedKey}" for locale "${locale}" must be a string.`
        )
      }

      if (flattenedKey in entries) {
        throw new Error(
          `Duplicate message key "${flattenedKey}" for locale "${locale}".`
        )
      }

      entries[flattenedKey] = value
    }
  }

  return sortEntries(entries)
}

function validateDictionaries(dictionaries) {
  const [baseLocale, ...otherLocales] = Object.keys(dictionaries)

  if (!baseLocale) {
    throw new Error("No locales found in the i18n directory.")
  }

  const baseKeys = new Set(Object.keys(dictionaries[baseLocale]))

  for (const locale of otherLocales) {
    const localeKeys = new Set(Object.keys(dictionaries[locale]))
    const missingKeys = [...baseKeys].filter((key) => !localeKeys.has(key))
    const extraKeys = [...localeKeys].filter((key) => !baseKeys.has(key))

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      const details = [
        missingKeys.length > 0
          ? `missing keys: ${missingKeys.join(", ")}`
          : null,
        extraKeys.length > 0 ? `extra keys: ${extraKeys.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("; ")

      throw new Error(
        `Locale "${locale}" does not match locale "${baseLocale}": ${details}`
      )
    }
  }
}

const locales = (await readdir(messagesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right))

const dictionaries = {}

for (const locale of locales) {
  dictionaries[locale] = await buildLocale(locale)
}

validateDictionaries(dictionaries)

const translationKeys = Object.keys(dictionaries[locales[0]] ?? {}).sort(
  (left, right) => left.localeCompare(right)
)

const source = `export type TranslationKey =
${translationKeys.map((key) => `  | ${JSON.stringify(key)}`).join("\n")}\n`

await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, source)
