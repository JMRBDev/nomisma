/* eslint-disable max-lines */
import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { useForm, useStore } from "@tanstack/react-form"
import { createFileRoute } from "@tanstack/react-router"
import {
  CalendarRangeIcon,
  FilterIcon,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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

type TransactionType = (typeof transactionTypeOptions)[number]["value"]
type TransactionStatus = (typeof transactionStatusOptions)[number]["value"]
type SelectOption = { _id: string; name: string }

type TransactionFormValues = {
  type: TransactionType
  status: TransactionStatus
  amount: string
  date: string
  accountId: string
  toAccountId: string
  categoryId: string
  description: string
  note: string
}

type TransactionFilterValues = {
  type: string
  status: string
  accountId: string
  categoryId: string
  fromDate: string
  toDate: string
}

const DEFAULT_FILTER_VALUES: TransactionFilterValues = {
  type: "all",
  status: "all",
  accountId: "all",
  categoryId: "all",
  fromDate: "",
  toDate: "",
}

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
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [transactionError, setTransactionError] = useState("")

  const accountOptions = data?.accounts.active ?? []
  const allCategoryOptions = data?.categories.all ?? []
  const incomeCategoryOptions = data?.categories.activeIncome ?? []
  const expenseCategoryOptions = data?.categories.activeExpense ?? []

  const transactionForm = useForm({
    defaultValues: createTransactionDefaults([], []),
    validators: {
      onSubmit: ({ value }) => {
        const fields: Partial<Record<keyof TransactionFormValues, string>> = {}
        const resolvedAccountId = resolveOptionValue(
          value.accountId,
          accountOptions
        )

        if (!resolvedAccountId) {
          fields.accountId =
            "Add at least one account before recording a transaction."
        }

        if (Number(value.amount || "0") <= 0) {
          fields.amount = "Amount must be greater than zero."
        }

        if (!value.date) {
          fields.date = "Pick a date."
        }

        if (value.type === "transfer") {
          if (!value.toAccountId) {
            fields.toAccountId = "Transfers need a destination account."
          } else if (value.toAccountId === resolvedAccountId) {
            fields.toAccountId = "Pick two different accounts for a transfer."
          } else if (
            !accountOptions.some((account) => account._id === value.toAccountId)
          ) {
            fields.toAccountId = "Pick a valid destination account."
          }
        } else {
          const categoryOptions = getCategoryOptions(
            value.type,
            incomeCategoryOptions,
            expenseCategoryOptions
          )

          if (!resolveOptionValue(value.categoryId, categoryOptions)) {
            fields.categoryId = `Create at least one ${value.type} category in Settings before saving this transaction.`
          }
        }

        return Object.keys(fields).length > 0 ? { fields } : undefined
      },
    },
    onSubmitInvalid: () => {
      setTransactionError("")
    },
    onSubmit: async ({ value }) => {
      setTransactionError("")

      const resolvedAccountId = resolveOptionValue(
        value.accountId,
        accountOptions
      )
      const categoryOptions = getCategoryOptions(
        value.type,
        incomeCategoryOptions,
        expenseCategoryOptions
      )
      const resolvedCategoryId =
        value.type === "transfer"
          ? undefined
          : resolveOptionValue(value.categoryId, categoryOptions) || undefined

      try {
        const payload = {
          type: value.type,
          status: value.status,
          amount: Number(value.amount || "0"),
          date: value.date,
          accountId: resolvedAccountId as Id<"accounts">,
          toAccountId:
            value.type === "transfer" && value.toAccountId
              ? (value.toAccountId as Id<"accounts">)
              : undefined,
          categoryId: resolvedCategoryId
            ? (resolvedCategoryId as Id<"categories">)
            : undefined,
          description: value.description,
          note: value.note || undefined,
        }

        if (editingTransactionId) {
          await updateTransaction({
            transactionId: editingTransactionId as Id<"transactions">,
            ...payload,
          })
        } else {
          await createTransaction(payload)
        }

        setEditingTransactionId(null)
        setTransactionDialogOpen(false)
        transactionForm.reset(
          createTransactionDefaults(accountOptions, expenseCategoryOptions)
        )
      } catch (mutationError) {
        setTransactionError(
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to save the transaction."
        )
      }
    },
  })

  const filtersForm = useForm({
    defaultValues: DEFAULT_FILTER_VALUES,
  })

  const transactionValues = useStore(
    transactionForm.store,
    (state) => state.values
  )
  const transactionPending = useStore(
    transactionForm.store,
    (state) => state.isSubmitting
  )
  const filterValues = useStore(filtersForm.store, (state) => state.values)

  const categoryOptions = getCategoryOptions(
    transactionValues.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )
  const needsCategory = transactionValues.type !== "transfer"

  const filteredTransactions = useMemo(
    () =>
      (data?.transactions ?? []).filter((transaction) => {
        if (
          filterValues.type !== "all" &&
          transaction.type !== filterValues.type
        ) {
          return false
        }

        if (
          filterValues.status !== "all" &&
          transaction.status !== filterValues.status
        ) {
          return false
        }

        if (
          filterValues.accountId !== "all" &&
          transaction.accountId !== filterValues.accountId &&
          transaction.toAccountId !== filterValues.accountId
        ) {
          return false
        }

        if (
          filterValues.categoryId !== "all" &&
          transaction.categoryId !== filterValues.categoryId
        ) {
          return false
        }

        if (filterValues.fromDate && transaction.date < filterValues.fromDate) {
          return false
        }

        if (filterValues.toDate && transaction.date > filterValues.toDate) {
          return false
        }

        return true
      }),
    [data?.transactions, filterValues]
  )

  const activeFilterCount = useMemo(
    () =>
      [
        filterValues.type !== "all",
        filterValues.status !== "all",
        filterValues.accountId !== "all",
        filterValues.categoryId !== "all",
        Boolean(filterValues.fromDate),
        Boolean(filterValues.toDate),
      ].filter(Boolean).length,
    [filterValues]
  )

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currency = data.settings?.baseCurrency

  const openCreateDialog = () => {
    setEditingTransactionId(null)
    setTransactionError("")
    transactionForm.reset(
      createTransactionDefaults(accountOptions, expenseCategoryOptions)
    )
    setTransactionDialogOpen(true)
  }

  const loadTransactionIntoForm = (
    transaction: (typeof data.transactions)[number]
  ) => {
    setEditingTransactionId(transaction._id)
    setTransactionError("")
    transactionForm.reset({
      type: transaction.type,
      status: transaction.status,
      amount: toAmountInput(transaction.amount),
      date: transaction.date,
      accountId: transaction.accountId,
      toAccountId: transaction.toAccountId ?? "",
      categoryId: transaction.categoryId ?? "",
      description: transaction.description,
      note: transaction.note ?? "",
    })
    setTransactionDialogOpen(true)
  }

  const handleTransactionDialogChange = (open: boolean) => {
    setTransactionDialogOpen(open)

    if (!open) {
      setEditingTransactionId(null)
      setTransactionError("")
      transactionForm.reset(
        createTransactionDefaults(accountOptions, expenseCategoryOptions)
      )
    }
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Transactions"
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setFiltersSheetOpen((open) => !open)}
              variant={activeFilterCount > 0 ? "secondary" : "outline"}
            >
              {activeFilterCount || null}
              <FilterIcon />
            </Button>

            <Button
              onClick={openCreateDialog}
              disabled={accountOptions.length === 0}
            >
              Add transaction
              <PlusIcon />
            </Button>
          </div>
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
      ) : (
        <div className="grid items-start gap-6">
          {filteredTransactions.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ReceiptTextIcon />
                </EmptyMedia>
                <EmptyTitle>No Transactions Found</EmptyTitle>
                <EmptyDescription>
                  There are no transactions available for the current filters.
                  Get started by creating a transaction.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
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
        </div>
      )}

      <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Refine the transaction list without leaving the dashboard.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5 px-6 pb-6">
            <div className="grid gap-4">
              <filtersForm.Field name="type">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="mobile-filter-type">
                      <FieldTitle>Type</FieldTitle>
                    </FieldLabel>
                    <NativeSelect
                      id="mobile-filter-type"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                    >
                      <NativeSelectOption value="all">
                        All types
                      </NativeSelectOption>
                      {transactionTypeOptions.map((option) => (
                        <NativeSelectOption
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                )}
              </filtersForm.Field>

              <filtersForm.Field name="status">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="mobile-filter-status">
                      <FieldTitle>Status</FieldTitle>
                    </FieldLabel>
                    <NativeSelect
                      id="mobile-filter-status"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                    >
                      <NativeSelectOption value="all">
                        All statuses
                      </NativeSelectOption>
                      {transactionStatusOptions.map((option) => (
                        <NativeSelectOption
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                )}
              </filtersForm.Field>

              <filtersForm.Field name="accountId">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="mobile-filter-account">
                      <FieldTitle>Account</FieldTitle>
                    </FieldLabel>
                    <NativeSelect
                      id="mobile-filter-account"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                    >
                      <NativeSelectOption value="all">
                        All accounts
                      </NativeSelectOption>
                      {accountOptions.map((account) => (
                        <NativeSelectOption
                          key={account._id}
                          value={account._id}
                        >
                          {account.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                )}
              </filtersForm.Field>

              <filtersForm.Field name="categoryId">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="mobile-filter-category">
                      <FieldTitle>Category</FieldTitle>
                    </FieldLabel>
                    <NativeSelect
                      id="mobile-filter-category"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                    >
                      <NativeSelectOption value="all">
                        All categories
                      </NativeSelectOption>
                      {allCategoryOptions.map((category) => (
                        <NativeSelectOption
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                )}
              </filtersForm.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <filtersForm.Field name="fromDate">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="mobile-filter-from-date">
                        <FieldTitle>From</FieldTitle>
                      </FieldLabel>
                      <Input
                        id="mobile-filter-from-date"
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                    </Field>
                  )}
                </filtersForm.Field>

                <filtersForm.Field name="toDate">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="mobile-filter-to-date">
                        <FieldTitle>To</FieldTitle>
                      </FieldLabel>
                      <Input
                        id="mobile-filter-to-date"
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                    </Field>
                  )}
                </filtersForm.Field>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-background/60 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarRangeIcon className="size-4" />
                <span>{filteredTransactions.length} matching transactions</span>
              </div>
              {activeFilterCount > 0 ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => filtersForm.reset(DEFAULT_FILTER_VALUES)}
                >
                  Clear all
                </Button>
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>

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

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void transactionForm.handleSubmit()
            }}
          >
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <transactionForm.Field name="type">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="transaction-type">
                        <FieldTitle>Type</FieldTitle>
                      </FieldLabel>
                      <NativeSelect
                        id="transaction-type"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const nextType = event.target.value as TransactionType
                          field.handleChange(nextType)

                          if (nextType === "transfer") {
                            transactionForm.setFieldValue("categoryId", "")
                            transactionForm.setFieldValue("toAccountId", "")
                            return
                          }

                          const nextCategoryOptions = getCategoryOptions(
                            nextType,
                            incomeCategoryOptions,
                            expenseCategoryOptions
                          )
                          const currentCategoryId =
                            transactionForm.getFieldValue("categoryId")

                          if (
                            !nextCategoryOptions.some(
                              (category) => category._id === currentCategoryId
                            )
                          ) {
                            transactionForm.setFieldValue(
                              "categoryId",
                              nextCategoryOptions[0]?._id ?? ""
                            )
                          }

                          transactionForm.setFieldValue("toAccountId", "")
                        }}
                      >
                        {transactionTypeOptions.map((option) => (
                          <NativeSelectOption
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </Field>
                  )}
                </transactionForm.Field>

                <transactionForm.Field name="status">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="transaction-status">
                        <FieldTitle>Status</FieldTitle>
                      </FieldLabel>
                      <NativeSelect
                        id="transaction-status"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value as TransactionStatus
                          )
                        }
                      >
                        {transactionStatusOptions.map((option) => (
                          <NativeSelectOption
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </Field>
                  )}
                </transactionForm.Field>

                <transactionForm.Field name="amount">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="transaction-amount">
                        <FieldTitle>Amount</FieldTitle>
                      </FieldLabel>
                      <Input
                        id="transaction-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                      <FieldErrorMessage
                        error={getFirstError(field.state.meta.errors)}
                      />
                    </Field>
                  )}
                </transactionForm.Field>

                <transactionForm.Field name="date">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="transaction-date">
                        <FieldTitle>Date</FieldTitle>
                      </FieldLabel>
                      <Input
                        id="transaction-date"
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                      <FieldErrorMessage
                        error={getFirstError(field.state.meta.errors)}
                      />
                    </Field>
                  )}
                </transactionForm.Field>
              </div>

              <transactionForm.Field name="accountId">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="transaction-account">
                      <FieldTitle>
                        {transactionValues.type === "transfer"
                          ? "From account"
                          : "Account"}
                      </FieldTitle>
                    </FieldLabel>
                    <NativeSelect
                      id="transaction-account"
                      value={resolveOptionValue(
                        field.state.value,
                        accountOptions
                      )}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const nextAccountId = event.target.value
                        field.handleChange(nextAccountId)

                        if (
                          transactionForm.getFieldValue("toAccountId") ===
                          nextAccountId
                        ) {
                          transactionForm.setFieldValue("toAccountId", "")
                        }
                      }}
                    >
                      {accountOptions.map((account) => (
                        <NativeSelectOption
                          key={account._id}
                          value={account._id}
                        >
                          {account.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldErrorMessage
                      error={getFirstError(field.state.meta.errors)}
                    />
                  </Field>
                )}
              </transactionForm.Field>

              {transactionValues.type === "transfer" ? (
                <transactionForm.Field name="toAccountId">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="transaction-to-account">
                        <FieldTitle>Destination account</FieldTitle>
                      </FieldLabel>
                      <NativeSelect
                        id="transaction-to-account"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      >
                        <NativeSelectOption value="">
                          Choose account
                        </NativeSelectOption>
                        {accountOptions
                          .filter(
                            (account) =>
                              account._id !==
                              resolveOptionValue(
                                transactionValues.accountId,
                                accountOptions
                              )
                          )
                          .map((account) => (
                            <NativeSelectOption
                              key={account._id}
                              value={account._id}
                            >
                              {account.name}
                            </NativeSelectOption>
                          ))}
                      </NativeSelect>
                      <FieldErrorMessage
                        error={getFirstError(field.state.meta.errors)}
                      />
                    </Field>
                  )}
                </transactionForm.Field>
              ) : (
                <transactionForm.Field name="categoryId">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="transaction-category">
                        <FieldTitle>Category</FieldTitle>
                      </FieldLabel>
                      <NativeSelect
                        id="transaction-category"
                        value={resolveOptionValue(
                          field.state.value,
                          categoryOptions
                        )}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        disabled={categoryOptions.length === 0}
                      >
                        {categoryOptions.length === 0 ? (
                          <NativeSelectOption value="">
                            Create a category first
                          </NativeSelectOption>
                        ) : null}
                        {categoryOptions.map((category) => (
                          <NativeSelectOption
                            key={category._id}
                            value={category._id}
                          >
                            {category.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      <FieldErrorMessage
                        error={getFirstError(field.state.meta.errors)}
                      />
                    </Field>
                  )}
                </transactionForm.Field>
              )}

              <transactionForm.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="transaction-description">
                      <FieldTitle>Description</FieldTitle>
                    </FieldLabel>
                    <Input
                      id="transaction-description"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder={
                        transactionValues.type === "transfer"
                          ? "Transfer to savings"
                          : "Groceries"
                      }
                    />
                  </Field>
                )}
              </transactionForm.Field>

              <transactionForm.Field name="note">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="transaction-note">
                      <FieldTitle>Note</FieldTitle>
                    </FieldLabel>
                    <Textarea
                      id="transaction-note"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Optional context"
                    />
                  </Field>
                )}
              </transactionForm.Field>
            </FieldGroup>

            {transactionError ? (
              <p className="text-sm text-destructive">{transactionError}</p>
            ) : null}
            {needsCategory && categoryOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create at least one {transactionValues.type} category in
                Settings before saving this transaction.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={
                  transactionPending ||
                  accountOptions.length === 0 ||
                  (needsCategory && categoryOptions.length === 0)
                }
                className="flex-1"
              >
                {transactionPending
                  ? "Saving..."
                  : editingTransactionId
                    ? "Update transaction"
                    : "Save transaction"}
              </Button>
              {editingTransactionId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={openCreateDialog}
                >
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

function createTransactionDefaults(
  accountOptions: Array<{ _id: string }>,
  expenseCategoryOptions: Array<{ _id: string }>
): TransactionFormValues {
  return {
    type: "expense",
    status: "posted",
    amount: "0",
    date: todayInputValue(),
    accountId: accountOptions[0]?._id ?? "",
    toAccountId: "",
    categoryId: expenseCategoryOptions[0]?._id ?? "",
    description: "",
    note: "",
  }
}

function getCategoryOptions(
  type: TransactionType,
  incomeCategoryOptions: Array<SelectOption>,
  expenseCategoryOptions: Array<SelectOption>
) {
  if (type === "income") {
    return incomeCategoryOptions
  }

  if (type === "expense") {
    return expenseCategoryOptions
  }

  return []
}

function resolveOptionValue(
  value: string,
  options: Array<{ _id: string }>
): string {
  if (options.some((option) => option._id === value)) {
    return value
  }

  return options[0]?._id ?? ""
}

function getFirstError(errors: Array<unknown>) {
  const [error] = errors

  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return null
}

function FieldErrorMessage({ error }: { error: string | null }) {
  if (!error) {
    return null
  }

  return <p className="text-sm text-destructive">{error}</p>
}
