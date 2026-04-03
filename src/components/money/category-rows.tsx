import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon } from "lucide-react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CategoryEditorRow({
  category,
}: {
  category: {
    _id: Id<"categories">
    name: string
    kind: "income" | "expense"
  }
}) {
  const updateCategory = useConvexMutation(api.categories.updateCategory)
  const moveCategory = useConvexMutation(api.categories.moveCategory)
  const toggleCategoryArchived = useConvexMutation(
    api.categories.toggleCategoryArchived
  )
  const [name, setName] = useState(category.name)
  const [error, setError] = useState("")

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    try {
      await updateCategory({
        categoryId: category._id,
        name,
      })
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the category."
      )
    }
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-background/40 p-4">
      <form className="space-y-3" onSubmit={handleSave}>
        <div className="flex flex-wrap items-center gap-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
          <Button type="submit" size="sm" variant="outline">
            <PencilIcon />
            Save
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() =>
              void moveCategory({
                categoryId: category._id,
                direction: "up",
              })
            }
            aria-label="Move category up"
          >
            <ArrowUpIcon />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() =>
              void moveCategory({
                categoryId: category._id,
                direction: "down",
              })
            }
            aria-label="Move category down"
          >
            <ArrowDownIcon />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              void toggleCategoryArchived({
                categoryId: category._id,
                archived: true,
              })
            }
          >
            Archive
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>
    </div>
  )
}

export function ArchivedCategoryRow({
  category,
}: {
  category: {
    _id: Id<"categories">
    name: string
    kind: "income" | "expense"
  }
}) {
  const toggleCategoryArchived = useConvexMutation(
    api.categories.toggleCategoryArchived
  )

  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-background/40 px-4 py-3">
      <div className="space-y-1">
        <p className="font-medium">{category.name}</p>
        <p className="text-sm text-muted-foreground">{category.kind}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          void toggleCategoryArchived({
            categoryId: category._id,
            archived: false,
          })
        }
      >
        Restore
      </Button>
    </div>
  )
}
