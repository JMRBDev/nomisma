import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useConvexMutation } from "@convex-dev/react-query"
import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RepeatIcon,
} from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import { RecurringRuleDialog } from "@/components/money/recurring-rule-dialog"
import {
  DashboardPageHeader,
  GuidedEmptyState,
  SectionCard,
} from "@/components/money/money-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRecurringPageData } from "@/hooks/use-money-dashboard"
import {
  formatCurrency,
  formatDateLabel,
  getRecurringTone,
  todayInputValue,
} from "@/lib/money"

export const Route = createFileRoute("/_authenticated/dashboard/recurring")({
  staticData: {
    breadcrumb: "Recurring",
  },
  component: RecurringPage,
})

function RecurringPage() {
  const { data } = useRecurringPageData()
  const createRecurringRule = useConvexMutation(
    api.recurring.createRecurringRule
  )
  const toggleRecurringRule = useConvexMutation(
    api.recurring.toggleRecurringRule
  )
  const confirmRecurringRule = useConvexMutation(
    api.recurring.confirmRecurringRule
  )
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("0")
  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly")
  const [startDate, setStartDate] = useState(todayInputValue())
  const [nextDueDate, setNextDueDate] = useState(todayInputValue())
  const [endDate, setEndDate] = useState("")
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currency = data.settings?.baseCurrency
  const activeAccounts = data.accounts.active
  const categoryOptions =
    type === "income"
      ? data.categories.activeIncome
      : data.categories.activeExpense

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError("")

    const resolvedAccountId = accountId || activeAccounts[0]?._id
    const resolvedCategoryId = categoryId || categoryOptions[0]?._id

    if (!resolvedAccountId || !resolvedCategoryId) {
      setError(
        "Add an account and matching categories before creating recurring items."
      )
      setPending(false)
      return
    }

    try {
      await createRecurringRule({
        type,
        amount: Number(amount || "0"),
        accountId: resolvedAccountId as Id<"accounts">,
        categoryId: resolvedCategoryId as Id<"categories">,
        description,
        frequency,
        startDate,
        nextDueDate,
        endDate: endDate || undefined,
      })
      setAmount("0")
      setDescription("")
      setEndDate("")
      setRecurringDialogOpen(false)
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the recurring item."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        eyebrow="Fixed flows"
        title="Recurring items"
        description="Keep regular bills and income visible before they happen. Reminders stay planned until you confirm them, which keeps balances honest."
        action={
          <Button
            onClick={() => setRecurringDialogOpen(true)}
            disabled={activeAccounts.length === 0}
          >
            Add recurring item
            <PlusIcon />
          </Button>
        }
      />

      {activeAccounts.length === 0 ? (
        <GuidedEmptyState
          title="Recurring items need an account first"
          description="Create at least one account so rent, subscriptions, or salary have a real place to land."
          ctaLabel="Go to accounts"
          ctaTo="/dashboard/accounts"
          icon={<RepeatIcon className="size-5" />}
        />
      ) : null}

      <SectionCard
        title="Recurring list"
        description="Due soon and overdue items stay visible until you confirm them."
      >
        {data.recurring.all.length === 0 ? (
          <GuidedEmptyState
            title="No recurring items yet"
            description="Track your next rent, salary, subscription, or other fixed money movement."
            icon={<RepeatIcon className="size-5" />}
            action={
              activeAccounts.length > 0 ? (
                <Button onClick={() => setRecurringDialogOpen(true)}>
                  Create recurring item
                  <PlusIcon />
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {data.recurring.all.map((item) => (
              <div
                key={item._id}
                className="rounded-[2rem] border border-border/60 bg-background/40 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.description}</p>
                      <Badge variant={item.active ? "default" : "outline"}>
                        {item.active ? "Active" : "Paused"}
                      </Badge>
                      <Badge variant="outline">{item.frequency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.accountName} · {item.categoryName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.amount, currency)}
                    </p>
                    <p className={`text-sm ${getRecurringTone(item.status)}`}>
                      Due {formatDateLabel(item.nextDueDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    onClick={() =>
                      void confirmRecurringRule({
                        ruleId: item._id,
                        date: item.nextDueDate,
                      })
                    }
                  >
                    <CheckIcon />
                    Confirm due item
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void toggleRecurringRule({
                        ruleId: item._id,
                        active: !item.active,
                      })
                    }
                  >
                    {item.active ? <PauseIcon /> : <PlayIcon />}
                    {item.active ? "Pause" : "Resume"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <RecurringRuleDialog
        open={recurringDialogOpen}
        onOpenChange={setRecurringDialogOpen}
        onSubmit={handleSubmit}
        type={type}
        setType={setType}
        amount={amount}
        setAmount={setAmount}
        activeAccounts={activeAccounts}
        accountId={accountId}
        setAccountId={setAccountId}
        categoryOptions={categoryOptions}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        description={description}
        setDescription={setDescription}
        frequency={frequency}
        setFrequency={setFrequency}
        startDate={startDate}
        setStartDate={setStartDate}
        nextDueDate={nextDueDate}
        setNextDueDate={setNextDueDate}
        endDate={endDate}
        setEndDate={setEndDate}
        error={error}
        pending={pending}
      />
    </section>
  )
}
