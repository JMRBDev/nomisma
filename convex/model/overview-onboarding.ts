export function buildOnboarding(args: {
  hasSettings: boolean
  accountCount: number
  transactionCount: number
  categoryCount: number
  budgetCount: number
  recurringCount: number
}) {
  const completedCount = [
    args.hasSettings,
    args.accountCount > 0,
    args.transactionCount > 0,
    args.categoryCount > 0,
    args.budgetCount > 0,
    args.recurringCount > 0,
  ].filter(Boolean).length

  return {
    completedCount,
    totalCount: 6,
    steps: [
      {
        id: "currency",
        title: "Choose your currency",
        description: "Set the base currency used across balances and budgets.",
        completed: args.hasSettings,
        href: "/dashboard/settings",
      },
      {
        id: "account",
        title: "Add your first account",
        description: "Start with the account or cash balance you use the most.",
        completed: args.accountCount > 0,
        href: "/dashboard/accounts",
      },
      {
        id: "transaction",
        title: "Add a recent transaction",
        description:
          "Record one recent income or expense to start tracking activity.",
        completed: args.transactionCount > 0,
        href: "/dashboard/transactions",
      },
      {
        id: "categories",
        title: "Create your categories",
        description: "Add the income and expense categories you actually use.",
        completed: args.categoryCount > 0,
        href: "/dashboard/transactions",
      },
      {
        id: "budget",
        title: "Create a budget",
        description:
          "Set a spending limit for the month or for a key category.",
        completed: args.budgetCount > 0,
        href: "/dashboard/budgets",
      },
      {
        id: "recurring",
        title: "Add a recurring item",
        description: "Track the next fixed bill or income that is due.",
        completed: args.recurringCount > 0,
        href: "/dashboard/recurring",
      },
    ],
  }
}
