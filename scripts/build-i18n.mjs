import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const rootDir = process.cwd()
const messagesDir = path.join(rootDir, "i18n")
const outputFile = path.join(
  rootDir,
  "src",
  "lib",
  "i18n-messages.generated.ts"
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

const locales = (await readdir(messagesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right))

const dictionaries = {}

for (const locale of locales) {
  dictionaries[locale] = await buildLocale(locale)
}

const source = `export const dictionaries = ${JSON.stringify(
  sortEntries(dictionaries),
  null,
  2
)} as const\n`

await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, source)
