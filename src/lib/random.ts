export function pickRandomItem<T>(items: ReadonlyArray<T>) {
  return items[Math.floor(Math.random() * items.length)]
}
