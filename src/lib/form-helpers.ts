type HasId = { _id: string }

export function getFirstOptionId<T extends HasId>(options: Array<T>): string {
  return options[0]?._id ?? ""
}

export function resolveValidOption<T extends HasId>(
  value: string,
  options: Array<T>
): string {
  if (options.some((option) => option._id === value)) {
    return value
  }

  return getFirstOptionId(options)
}

export function getCategoryOptions<
  TIncome extends HasId,
  TExpense extends HasId,
>(
  type: "income" | "expense" | "transfer",
  incomeCategoryOptions: Array<TIncome>,
  expenseCategoryOptions: Array<TExpense>
): Array<TIncome> | Array<TExpense> {
  if (type === "income") {
    return incomeCategoryOptions
  }

  if (type === "expense") {
    return expenseCategoryOptions
  }

  return []
}
