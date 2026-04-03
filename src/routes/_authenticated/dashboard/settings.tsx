import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useConvexMutation } from "@convex-dev/react-query"
import { ArchiveRestoreIcon, PlusIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import {
  ArchivedCategoryRow,
  CategoryEditorRow,
} from "@/components/money/category-rows"
import { DashboardPageHeader, SectionCard } from "@/components/money/money-ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { useSettingsPageData } from "@/hooks/use-money-dashboard"
import { currencyOptions } from "@/lib/money"

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  staticData: {
    breadcrumb: "Settings",
  },
  component: SettingsPage,
})

function SettingsPage() {
  const { data } = useSettingsPageData()
  const upsertSettings = useConvexMutation(api.settings.upsertSettings)
  const createCategory = useConvexMutation(api.categories.createCategory)
  const toggleAccountArchived = useConvexMutation(
    api.accounts.toggleAccountArchived
  )
  const [categoryKind, setCategoryKind] = useState<"expense" | "income">(
    "expense"
  )
  const [categoryName, setCategoryName] = useState("")
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryError, setCategoryError] = useState("")
  const [settingsError, setSettingsError] = useState("")

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const handleSettingsSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setSettingsError("")
    const formData = new FormData(event.currentTarget)

    try {
      await upsertSettings({
        baseCurrency: String(formData.get("baseCurrency") ?? ""),
        monthStartsOn: Number(formData.get("monthStartsOn") ?? ""),
      })
    } catch (mutationError) {
      setSettingsError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save settings."
      )
    }
  }

  const handleCategorySubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setCategoryError("")

    try {
      await createCategory({
        kind: categoryKind,
        name: categoryName,
      })
      setCategoryName("")
      setCategoryDialogOpen(false)
    } catch (mutationError) {
      setCategoryError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the category."
      )
    }
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        eyebrow="Foundations"
        title="Settings"
        description="Keep the app grounded in your preferred currency and reporting rhythm, then tidy up categories and archived accounts when needed."
        action={
          <Button onClick={() => setCategoryDialogOpen(true)}>
            Add category
            <PlusIcon />
          </Button>
        }
      />

      <SectionCard
        title="General"
        description="These settings shape how the dashboard interprets your money."
      >
        <form className="space-y-4" onSubmit={handleSettingsSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="base-currency">
                <FieldTitle>Base currency</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="base-currency"
                name="baseCurrency"
                defaultValue={data.settings?.baseCurrency ?? ""}
              >
                <NativeSelectOption value="">Choose currency</NativeSelectOption>
                {currencyOptions.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="month-starts-on">
                <FieldTitle>Reporting month starts on</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="month-starts-on"
                name="monthStartsOn"
                defaultValue={
                  data.settings ? String(data.settings.monthStartsOn) : ""
                }
              >
                <NativeSelectOption value="">Choose day</NativeSelectOption>
                {Array.from({ length: 28 }, (_, index) => index + 1).map(
                  (day) => (
                    <NativeSelectOption key={day} value={String(day)}>
                      Day {day}
                    </NativeSelectOption>
                  )
                )}
              </NativeSelect>
            </Field>
          </FieldGroup>

          {settingsError ? (
            <p className="text-sm text-destructive">{settingsError}</p>
          ) : null}

          <Button type="submit">Save settings</Button>
        </form>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Expense categories"
          description="These are used in budgets and spending insights."
        >
          <div className="space-y-3">
            {data.categories.activeExpense.map((category) => (
              <CategoryEditorRow key={category._id} category={category} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Income categories"
          description="Use these to keep incoming money readable and consistent."
        >
          <div className="space-y-3">
            {data.categories.activeIncome.map((category) => (
              <CategoryEditorRow key={category._id} category={category} />
            ))}
          </div>
        </SectionCard>
      </div>

      {(data.categories.archivedExpense.length > 0 ||
        data.categories.archivedIncome.length > 0) && (
        <SectionCard
          title="Archived categories"
          description="Archived items stay linked to past history without getting in the way of new data entry."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ...data.categories.archivedExpense,
              ...data.categories.archivedIncome,
            ].map((category) => (
              <ArchivedCategoryRow key={category._id} category={category} />
            ))}
          </div>
        </SectionCard>
      )}

      {data.accounts.archived.length > 0 ? (
        <SectionCard
          title="Archived accounts"
          description="Restore old accounts if you need them back in the main list."
        >
          <div className="grid gap-3">
            {data.accounts.archived.map((account) => (
              <div
                key={account._id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-background/40 px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {account.type}
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
                  <ArchiveRestoreIcon />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
            <DialogDescription>
              Categories power budgets, summaries, and recurring items, so keep
              them short and familiar.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCategorySubmit}>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="category-kind">
                    <FieldTitle>Category type</FieldTitle>
                  </FieldLabel>
                  <NativeSelect
                    id="category-kind"
                    value={categoryKind}
                    onChange={(event) =>
                      setCategoryKind(event.target.value as typeof categoryKind)
                    }
                  >
                    <NativeSelectOption value="expense">Expense</NativeSelectOption>
                    <NativeSelectOption value="income">Income</NativeSelectOption>
                  </NativeSelect>
                </Field>

                <Field>
                  <FieldLabel htmlFor="category-name">
                    <FieldTitle>Name</FieldTitle>
                  </FieldLabel>
                  <Input
                    id="category-name"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="Insurance"
                  />
                </Field>
              </div>
            </FieldGroup>

            {categoryError ? (
              <p className="text-sm text-destructive">{categoryError}</p>
            ) : null}

            <Button type="submit" className="w-full">
              Add category
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
