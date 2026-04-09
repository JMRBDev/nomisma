import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const rootDir = process.cwd()
const messagesDir = path.join(rootDir, "messages")
const outputDir = path.join(messagesDir, ".paraglide")

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function flattenMessages(namespace, value, prefix = "") {
  if (!isPlainObject(value)) {
    return [{ key: `${namespace}_${prefix}`, value }]
  }

  return Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([key, nestedValue]) =>
      flattenMessages(
        namespace,
        nestedValue,
        prefix ? `${prefix}_${key}` : key
      )
    )
}

async function buildLocale(locale) {
  const localeDir = path.join(messagesDir, locale)
  const files = (await readdir(localeDir))
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right))

  const merged = {}

  for (const file of files) {
    const namespace = path.basename(file, ".json")
    const raw = await readFile(path.join(localeDir, file), "utf8")
    const entries = flattenMessages(namespace, JSON.parse(raw))

    for (const entry of entries) {
      if (entry.key in merged) {
        throw new Error(`Duplicate message key "${entry.key}" for locale "${locale}".`)
      }

      merged[entry.key] = entry.value
    }
  }

  await writeFile(
    path.join(outputDir, `${locale}.json`),
    `${JSON.stringify(merged, null, 2)}\n`
  )
}

await rm(outputDir, { recursive: true, force: true })
await mkdir(outputDir, { recursive: true })

for (const locale of ["en", "es"]) {
  await buildLocale(locale)
}
