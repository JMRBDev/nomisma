export function pickRandomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)]
}
