import { z } from "zod"

export const FrontendHintsSchema = z.object({
  route: z.string().trim().min(1).optional(),
  selectedIds: z.array(z.string().trim().min(1)).max(20).optional(),
})

export type FrontendHints = z.infer<typeof FrontendHintsSchema>
