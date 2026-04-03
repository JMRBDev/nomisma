/* eslint-disable max-lines */
import { useDeferredValue, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useConvexMutation } from "@convex-dev/react-query"
import {
  CalendarRangeIcon,
  PencilIcon,
  PlusIcon,
  ReceiptTextIcon,
  Trash2Icon,
} from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import {
  DashboardPageHeader,
  GuidedEmptyState,
  SectionCard,
} from "@/components/money/money-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useTransactionsPageData } from "@/hooks/use-money-dashboard"
import {
  formatCurrency,
  formatDateLabel,
  getTransactionTone,
  toAmountInput,
  todayInputValue,
  transactionStatusOptions,
  transactionTypeOptions,
} from "@/lib/money"

export const Route = createFileRoute("/_authenticated/dashboard/transactions")({
  staticData: {
    breadcrumb: "Transactions",
  },
  component: TransactionsPage,
})

function TransactionsPage() {
  const { data } = useTransactionsPageData()
  const createTransaction = useConvexMutation(
    api.transactions.createTransaction
  )
  const updateTransaction = useConvexMutation(
    api.transactions.updateTransaction
  )
  const deleteTransaction = useConvexMutation(
    api.transactions.deleteTransaction
  )

  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null)
  const [type, setType] =
    useState<(typeof transactionTypeOptions)[number]["value"]>("expense")
  const [status, setStatus] =
    useState<(typeof transactionStatusOptions)[number]["value"]>("posted")
  const [amount, setAmount] = useState("0")
  const [date, setDate] = useState(todayInputValue())
  const [accountId, setAccountId] = useState("")
  const [toAccountId, setToAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [note, setNote] = useState("")
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [accountFilter, setAccountFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  const filteredTransactions = useMemo(
    () =>
      (data?.transactions ?? []).filter((transaction) => {
        if (
          deferredSearch &&
          ![
            transaction.description,
            transaction.accountName,
            transaction.toAccountName ?? "",
            transaction.categoryName ?? "",
            transaction.note ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(deferredSearch)
        ) {
          return false
        }

        if (typeFilter !== "all" && transaction.type !== typeFilter) {
          return false
        }

        if (statusFilter !== "all" && transaction.status !== statusFilter) {
          return false
        }

        if (
          accountFilter !== "all" &&
          transaction.accountId !== accountFilter &&
          transaction.toAccountId !== accountFilter
        ) {
          return false
        }

        if (
          categoryFilter !== "all" &&
          transaction.categoryId !== categoryFilter
        ) {
          return false
        }

        if (fromDate && transaction.date < fromDate) {
          return false
        }

        if (toDate && transaction.date > toDate) {
          return false
        }

        return true
      }),
    [
      accountFilter,
      categoryFilter,
      data?.transactions,
      deferredSearch,
      fromDate,
      statusFilter,
      toDate,
      typeFilter,
    ]
  )

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currency = data.settings?.baseCurrency
  const accountOptions = data.accounts.active
  const categoryOptions =
    type === "income"
      ? data.categories.activeIncome
      : data.categories.activeExpense
  const needsCategory = type !== "transfer"

  const clearForm = () => {
    setEditingTransactionId(null)
    setType("expense")
    setStatus("posted")
    setAmount("0")
    setDate(todayInputValue())
    setAccountId("")
    setToAccountId("")
    setCategoryId("")
    setDescription("")
    setNote("")
    setError("")
  }

  const openCreateDialog = () => {
    clearForm()
    setTransactionDialogOpen(true)
  }

  const handleTransactionDialogChange = (open: boolean) => {
    setTransactionDialogOpen(open)
    if (!open) {
      clearForm()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError("")

    const resolvedAccountId = accountId || accountOptions[0]?._id
      const resolvedCategoryId =
        type === "transfer" ? undefined : categoryId || categoryOptions[0]?._id

    if (!resolvedAccountId) {
      setError("Add at least one account before recording a transaction.")
      setPending(false)
      return
    }

    try {
      const payload = {
        type,
        status,
        amount: Number(amount || "0"),
        date,
        accountId: resolvedAccountId as Id<"accounts">,
        toAccountId:
          type === "transfer" && toAccountId
            ? (toAccountId as Id<"accounts">)
            : undefined,
        categoryId: resolvedCategoryId
          ? (resolvedCategoryId as Id<"categories">)
          : undefined,
        description,
        note: note || undefined,
      }

      if (editingTransactionId) {
        await updateTransaction({
          transactionId: editingTransactionId as Id<"transactions">,
          ...payload,
        })
      } else {
        await createTransaction(payload)
      }

      clearForm()
      setTransactionDialogOpen(false)
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the transaction."
      )
    } finally {
      setPending(false)
    }
  }

  const loadTransactionIntoForm = (
    transaction: (typeof data.transactions)[number]
  ) => {
    setEditingTransactionId(transaction._id)
    setType(transaction.type)
    setStatus(transaction.status)
    setAmount(toAmountInput(transaction.amount))
    setDate(transaction.date)
    setAccountId(transaction.accountId)
    setToAccountId(transaction.toAccountId ?? "")
    setCategoryId(transaction.categoryId ?? "")
    setDescription(transaction.description)
    setNote(transaction.note ?? "")
    setError("")
    setTransactionDialogOpen(true)
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        eyebrow="Money movements"
        title="Transactions"
        description="Keep one clean ledger for income, expenses, and transfers. Posted entries affect balances and budgets. Planned entries help you see what is coming next."
        action={
          <Button
            onClick={openCreateDialog}
            disabled={accountOptions.length === 0}
          >
            Add transaction
            <PlusIcon />
          </Button>
        }
      />

      {accountOptions.length === 0 ? (
        <GuidedEmptyState
          title="Add an account before recording transactions"
          description="Transactions need an account because every movement starts from somewhere real."
          ctaLabel="Create an account"
          ctaTo="/dashboard/accounts"
          icon={<ReceiptTextIcon className="size-5" />}
        />
      ) : null}

      <SectionCard
        title="Filter list"
        description="Search and narrow down movements by type, account, category, status, or date range."
      >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="search-transactions">
                <FieldTitle>Search</FieldTitle>
              </FieldLabel>
              <Input
                id="search-transactions"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Groceries, salary, wallet..."
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-type">
                <FieldTitle>Type</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="filter-type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <NativeSelectOption value="all">All types</NativeSelectOption>
                {transactionTypeOptions.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-status">
                <FieldTitle>Status</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="filter-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <NativeSelectOption value="all">
                  All statuses
                </NativeSelectOption>
                {transactionStatusOptions.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-account">
                <FieldTitle>Account</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="filter-account"
                value={accountFilter}
                onChange={(event) => setAccountFilter(event.target.value)}
              >
                <NativeSelectOption value="all">
                  All accounts
                </NativeSelectOption>
                {data.accounts.active.map((account) => (
                  <NativeSelectOption key={account._id} value={account._id}>
                    {account.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-category">
                <FieldTitle>Category</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="filter-category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <NativeSelectOption value="all">
                  All categories
                </NativeSelectOption>
                {data.categories.all.map((category) => (
                  <NativeSelectOption key={category._id} value={category._id}>
                    {category.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-from-date">
                <FieldTitle>From</FieldTitle>
              </FieldLabel>
              <Input
                id="filter-from-date"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-to-date">
                <FieldTitle>To</FieldTitle>
              </FieldLabel>
              <Input
                id="filter-to-date"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </Field>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRangeIcon className="size-4" />
            {filteredTransactions.length} matching transactions
          </div>
      </SectionCard>

      <SectionCard
        title="Transaction list"
        description="Newest entries first. Transfers move money without affecting income or expense totals."
      >
        {filteredTransactions.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            No transactions match the current filters.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{formatDateLabel(transaction.date)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{transaction.description}</p>
                      {transaction.note ? (
                        <p className="text-xs text-muted-foreground">
                          {transaction.note}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.accountName}
                    {transaction.toAccountName
                      ? ` → ${transaction.toAccountName}`
                      : ""}
                  </TableCell>
                  <TableCell>
                    {transaction.categoryName ?? "Transfer"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="outline">{transaction.type}</Badge>
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
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${getTransactionTone(transaction.type)}`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount, currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => loadTransactionIntoForm(transaction)}
                        aria-label="Edit transaction"
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() =>
                          void deleteTransaction({
                            transactionId: transaction._id,
                          })
                        }
                        aria-label="Delete transaction"
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog
        open={transactionDialogOpen}
        onOpenChange={handleTransactionDialogChange}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransactionId ? "Edit transaction" : "Add transaction"}
            </DialogTitle>
            <DialogDescription>
              Keep amounts positive. The transaction type decides whether it
              adds money, spends money, or moves money between your accounts.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="transaction-type">
                    <FieldTitle>Type</FieldTitle>
                  </FieldLabel>
                  <NativeSelect
                    id="transaction-type"
                    value={type}
                    onChange={(event) => setType(event.target.value as typeof type)}
                  >
                    {transactionTypeOptions.map((option) => (
                      <NativeSelectOption key={option.value} value={option.value}>
                        {option.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>

                <Field>
                  <FieldLabel htmlFor="transaction-status">
                    <FieldTitle>Status</FieldTitle>
                  </FieldLabel>
                  <NativeSelect
                    id="transaction-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as typeof status)}
                  >
                    {transactionStatusOptions.map((option) => (
                      <NativeSelectOption key={option.value} value={option.value}>
                        {option.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>

                <Field>
                  <FieldLabel htmlFor="transaction-amount">
                    <FieldTitle>Amount</FieldTitle>
                  </FieldLabel>
                  <Input
                    id="transaction-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="transaction-date">
                    <FieldTitle>Date</FieldTitle>
                  </FieldLabel>
                  <Input
                    id="transaction-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="transaction-account">
                  <FieldTitle>
                    {type === "transfer" ? "From account" : "Account"}
                  </FieldTitle>
                </FieldLabel>
                <NativeSelect
                  id="transaction-account"
                  value={accountId || accountOptions[0]?._id}
                  onChange={(event) => setAccountId(event.target.value)}
                >
                  {accountOptions.map((account) => (
                    <NativeSelectOption key={account._id} value={account._id}>
                      {account.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              {type === "transfer" ? (
                <Field>
                  <FieldLabel htmlFor="transaction-to-account">
                    <FieldTitle>Destination account</FieldTitle>
                  </FieldLabel>
                  <NativeSelect
                    id="transaction-to-account"
                    value={toAccountId}
                    onChange={(event) => setToAccountId(event.target.value)}
                  >
                    <NativeSelectOption value="">Choose account</NativeSelectOption>
                    {accountOptions
                      .filter(
                        (account) =>
                          account._id !== (accountId || accountOptions[0]?._id)
                      )
                      .map((account) => (
                        <NativeSelectOption key={account._id} value={account._id}>
                          {account.name}
                        </NativeSelectOption>
                      ))}
                  </NativeSelect>
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="transaction-category">
                    <FieldTitle>Category</FieldTitle>
                  </FieldLabel>
                  <NativeSelect
                    id="transaction-category"
                    value={categoryId || categoryOptions[0]?._id}
                    onChange={(event) => setCategoryId(event.target.value)}
                    disabled={categoryOptions.length === 0}
                  >
                    {categoryOptions.length === 0 ? (
                      <NativeSelectOption value="">
                        Create a category first
                      </NativeSelectOption>
                    ) : null}
                    {categoryOptions.map((category) => (
                      <NativeSelectOption key={category._id} value={category._id}>
                        {category.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="transaction-description">
                  <FieldTitle>Description</FieldTitle>
                </FieldLabel>
                <Input
                  id="transaction-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={
                    type === "transfer" ? "Transfer to savings" : "Groceries"
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="transaction-note">
                  <FieldTitle>Note</FieldTitle>
                </FieldLabel>
                <Textarea
                  id="transaction-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional context"
                />
              </Field>
            </FieldGroup>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {needsCategory && categoryOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create at least one {type} category in Settings before saving
                this transaction.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={
                  pending ||
                  accountOptions.length === 0 ||
                  (needsCategory && categoryOptions.length === 0)
                }
                className="flex-1"
              >
                {pending
                  ? "Saving..."
                  : editingTransactionId
                    ? "Update transaction"
                    : "Save transaction"}
              </Button>
              {editingTransactionId ? (
                <Button type="button" variant="outline" onClick={openCreateDialog}>
                  New transaction
                </Button>
              ) : null}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
