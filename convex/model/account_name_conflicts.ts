import { getAccountsByUserId } from "./queries"
import type { getOwnedAccount } from "./queries"
import type { MutationCtx } from "../_generated/server"

export function normalizeEntityName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase()
}

export async function getAccountNameConflicts(
  ctx: MutationCtx,
  userId: string,
  name: string,
  excludedAccountId?: Parameters<typeof getOwnedAccount>[2]
) {
  const normalizedName = normalizeEntityName(name)
  const accounts = await getAccountsByUserId(ctx, userId)

  return accounts.filter((account) => {
    if (excludedAccountId && account._id === excludedAccountId) {
      return false
    }

    return normalizeEntityName(account.name) === normalizedName
  })
}
