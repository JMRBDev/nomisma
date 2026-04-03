import { Link, createFileRoute } from "@tanstack/react-router"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  RepeatIcon,
  TargetIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DashboardPageHeader,
  GuidedEmptyState,
  MetricCard,
  SectionCard,
} from "@/components/money/money-ui"
import { useOverviewData } from "@/hooks/use-money-dashboard"
import {
  formatCurrency,
  formatDateLabel,
  getRecurringTone,
  getTransactionTone,
} from "@/lib/money"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  staticData: {
    breadcrumb: "Overview",
  },
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  const { data } = useOverviewData()

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currency = data.settings?.baseCurrency
  const hasAccounts = data.hasAccounts

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        eyebrow="Daily control"
        title="A clear picture of your money"
        description="This home view keeps the essentials in one place: what you have, what you spent, what is due next, and whether you are still inside your limits."
        action={
          <Button asChild>
            <Link
              to={
                hasAccounts ? "/dashboard/transactions" : "/dashboard/accounts"
              }
            >
              {hasAccounts ? "Add transaction" : "Add account"}
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      />

      {!hasAccounts ? (
        <GuidedEmptyState
          title="Start with the place where your money lives"
          description="Add your first account, then record one income or expense so the app can start giving you useful totals."
          ctaLabel="Set up your first account"
          ctaTo="/dashboard/accounts"
          icon={<PiggyBankIcon className="size-5" />}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Current money"
          value={formatCurrency(data.overview.currentMoney, currency)}
          note="Included active accounts"
        />
        <MetricCard
          label="This month income"
          value={formatCurrency(data.overview.income, currency)}
          note="Posted income only"
        />
        <MetricCard
          label="This month expenses"
          value={formatCurrency(data.overview.expenses, currency)}
          note="Posted expenses only"
        />
        <MetricCard
          label="Net this month"
          value={formatCurrency(data.overview.net, currency)}
          note="Income minus expenses"
        />
        <MetricCard
          label="Budget remaining"
          value={
            data.overview.budgetRemaining === null
              ? "No budget yet"
              : formatCurrency(data.overview.budgetRemaining, currency)
          }
          note={data.currentMonth}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard
          title="Onboarding"
          description={`${data.onboarding.completedCount} of ${data.onboarding.totalCount} core setup steps completed.`}
        >
          <div className="grid gap-3">
            {data.onboarding.steps.map((step) => (
              <div
                key={step.id}
                className="flex items-start justify-between gap-4 rounded-3xl border border-border/60 bg-background/40 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{step.title}</p>
                    <Badge variant={step.completed ? "default" : "outline"}>
                      {step.completed ? "Done" : "Next"}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to={step.href}>
                    Open
                    <ArrowRightIcon />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Warnings"
          description="Practical reminders that help you stay ahead of spending and fixed payments."
        >
          {data.overview.alerts.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Nothing urgent right now. Your budgets and recurring reminders
              look under control.
            </p>
          ) : (
            <div className="space-y-3">
              {data.overview.alerts.map((alert) => (
                <Alert
                  key={`${alert.title}-${alert.description}`}
                  variant={alert.kind}
                >
                  <AlertTriangleIcon className="size-4" />
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Top spending categories"
          description="The biggest expense areas in the current reporting period."
          action={
            <Button size="sm" variant="outline" asChild>
              <Link to="/dashboard/budgets">Budgets</Link>
            </Button>
          }
        >
          {data.overview.topSpendingCategories.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Once you add posted expenses, the main spending categories will
              show up here.
            </p>
          ) : (
            <div className="space-y-3">
              {data.overview.topSpendingCategories.map((category, index) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-background/40 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{category.categoryName}</p>
                      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                        Current period
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(category.amount, currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming recurring items"
          description="The next fixed income or expense that needs your attention."
          action={
            <Button size="sm" variant="outline" asChild>
              <Link to="/dashboard/recurring">
                Recurring
                <RepeatIcon />
              </Link>
            </Button>
          }
        >
          {data.overview.upcomingRecurring.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Add a recurring item to keep future bills and regular income
              visible.
            </p>
          ) : (
            <div className="space-y-3">
              {data.overview.upcomingRecurring.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between gap-4 rounded-3xl border border-border/60 bg-background/40 px-4 py-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.description}</p>
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
                      {formatDateLabel(item.nextDueDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Recent transactions"
          description="The latest money movements across your active accounts."
          action={
            <Button size="sm" variant="outline" asChild>
              <Link to="/dashboard/transactions">
                All transactions
                <ReceiptTextIcon />
              </Link>
            </Button>
          }
        >
          {data.overview.recentTransactions.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Add your first transaction to start building your history.
            </p>
          ) : (
            <div className="space-y-3">
              {data.overview.recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-background/40 px-4 py-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.description}</p>
                      <Badge
                        variant={
                          transaction.status === "posted"
                            ? "default"
                            : "outline"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.accountName}
                      {transaction.toAccountName
                        ? ` → ${transaction.toAccountName}`
                        : ""}
                      {transaction.categoryName
                        ? ` · ${transaction.categoryName}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${getTransactionTone(transaction.type)}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount, currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateLabel(transaction.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Quick links"
          description="Jump into the part of the app that needs action."
        >
          <div className="grid gap-3">
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/dashboard/accounts">
                Accounts
                <PiggyBankIcon />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/dashboard/transactions">
                Transactions
                <ReceiptTextIcon />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/dashboard/budgets">
                Budgets
                <TargetIcon />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/dashboard/recurring">
                Recurring
                <RepeatIcon />
              </Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </section>
  )
}
