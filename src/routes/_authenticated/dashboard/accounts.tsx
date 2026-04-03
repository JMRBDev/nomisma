import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useConvexMutation } from "@convex-dev/react-query"
import { Layers3Icon, PiggyBankIcon, PlusIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import {
  DashboardPageHeader,
  GuidedEmptyState,
  SectionCard,
} from "@/components/money/money-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { useAccountsPageData } from "@/hooks/use-money-dashboard"
import { accountTypeOptions, formatCurrency } from "@/lib/money"

export const Route = createFileRoute("/_authenticated/dashboard/accounts")({
  staticData: {
    breadcrumb: "Accounts",
  },
  component: AccountsPage,
})

function AccountsPage() {
  const { data } = useAccountsPageData()
  const createAccount = useConvexMutation(api.accounts.createAccount)
  const toggleAccountArchived = useConvexMutation(
    api.accounts.toggleAccountArchived
  )
  const [name, setName] = useState("")
  const [type, setType] =
    useState<(typeof accountTypeOptions)[number]["value"]>("checking")
  const [openingBalance, setOpeningBalance] = useState("0")
  const [includeInTotals, setIncludeInTotals] = useState(true)
  const [color, setColor] = useState("#d96d4b")
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currency = data.settings?.baseCurrency

  const handleCreateAccount = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setPending(true)
    setError("")

    try {
      await createAccount({
        name,
        type,
        openingBalance: Number(openingBalance || "0"),
        includeInTotals,
        color,
      })
      setName("")
      setType("checking")
      setOpeningBalance("0")
      setIncludeInTotals(true)
      setColor("#d96d4b")
      setAccountDialogOpen(false)
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the account."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        eyebrow="Money homes"
        title="Accounts"
        description="Keep every place where your money lives in one list, with balances, recent activity, and a clear decision on whether it should count in your totals."
        action={
          <Button onClick={() => setAccountDialogOpen(true)}>
            Add account
            <PlusIcon />
          </Button>
        }
      />

      <SectionCard
        title="Active accounts"
        description="Transfers move money between these balances without counting as income or spending."
      >
        {data.accounts.active.length === 0 ? (
          <GuidedEmptyState
            title="No accounts yet"
            description="Add your main bank account, savings, cash, or digital wallet so the app can start showing what you have."
            icon={<PiggyBankIcon className="size-5" />}
            action={
              <Button onClick={() => setAccountDialogOpen(true)}>
                Create your first account
                <PlusIcon />
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.accounts.active.map((account) => (
              <div
                key={account._id}
                className="rounded-[2rem] border border-border/60 bg-background/40 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full"
                        style={{
                          backgroundColor: account.color ?? "#d96d4b",
                        }}
                      />
                      <p className="font-medium">{account.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {
                        accountTypeOptions.find(
                          (option) => option.value === account.type
                        )?.label
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={account.includeInTotals ? "default" : "outline"}
                    >
                      {account.includeInTotals ? "Included" : "Hidden"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void toggleAccountArchived({
                          accountId: account._id,
                          archived: true,
                        })
                      }
                    >
                      Archive
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Current balance
                    </p>
                    <p className="mt-1 text-2xl font-medium">
                      {formatCurrency(account.currentBalance, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Opening balance
                    </p>
                    <p className="mt-1 text-2xl font-medium">
                      {formatCurrency(account.openingBalance, currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-background/60 p-3">
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Income
                    </p>
                    <p className="mt-1 font-medium">
                      {formatCurrency(account.income ?? 0, currency)}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-background/60 p-3">
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Expenses
                    </p>
                    <p className="mt-1 font-medium">
                      {formatCurrency(account.expense ?? 0, currency)}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-background/60 p-3">
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Transfers in
                    </p>
                    <p className="mt-1 font-medium">
                      {formatCurrency(account.transferIn ?? 0, currency)}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-background/60 p-3">
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      Transfers out
                    </p>
                    <p className="mt-1 font-medium">
                      {formatCurrency(account.transferOut ?? 0, currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    Recent activity
                  </p>
                  {(account.recentTransactions ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No transactions attached to this account yet.
                    </p>
                  ) : (
                    (account.recentTransactions ?? []).map((transaction) => (
                      <div
                        key={`${account._id}-${transaction._id}`}
                        className="flex items-center justify-between gap-4 rounded-3xl bg-background/60 px-3 py-2"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.categoryName ?? "Transfer"}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(transaction.amount, currency)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {data.accounts.archived.length > 0 ? (
        <SectionCard
          title="Archived accounts"
          description="Old money containers stay available for history without crowding the main list."
        >
          <div className="grid gap-3">
            {data.accounts.archived.map((account) => (
              <div
                key={account._id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-background/40 px-4 py-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers3Icon className="size-4 text-muted-foreground" />
                    <p className="font-medium">{account.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(account.currentBalance, currency)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void toggleAccountArchived({
                      accountId: account._id,
                      archived: false,
                    })
                  }
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add account</DialogTitle>
            <DialogDescription>
              Start with one account. You can add the rest after the overview
              begins to make sense.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateAccount}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="account-name">
                  <FieldTitle>Name</FieldTitle>
                </FieldLabel>
                <Input
                  id="account-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Main checking"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="account-type">
                  <FieldTitle>Type</FieldTitle>
                </FieldLabel>
                <NativeSelect
                  id="account-type"
                  value={type}
                  onChange={(event) => setType(event.target.value as typeof type)}
                >
                  {accountTypeOptions.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel htmlFor="opening-balance">
                  <FieldTitle>Opening balance</FieldTitle>
                </FieldLabel>
                <Input
                  id="opening-balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={openingBalance}
                  onChange={(event) => setOpeningBalance(event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="account-color">
                  <FieldTitle>Color accent</FieldTitle>
                </FieldLabel>
                <Input
                  id="account-color"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-11"
                />
              </Field>

              <Field orientation="horizontal">
                <Checkbox
                  checked={includeInTotals}
                  onCheckedChange={(checked) =>
                    setIncludeInTotals(Boolean(checked))
                  }
                />
                <FieldContent>
                  <FieldTitle>Include in overview totals</FieldTitle>
                  <FieldDescription>
                    Turn this off for accounts you want to keep as reference
                    only.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving..." : "Save account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
