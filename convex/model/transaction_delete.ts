import { assertNoNegativeBalances, buildBalanceMap } from "./balances"
import {
  getAccountsByUserId,
  getOwnedTransaction,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import type { MutationCtx } from "../_generated/server"

export async function deleteTransaction(
  ctx: MutationCtx,
  args: { transactionId: Parameters<typeof getOwnedTransaction>[2] }
) {
  const user = await requireUser(ctx)
  const transaction = await getOwnedTransaction(
    ctx,
    user._id,
    args.transactionId
  )
  const [accounts, existingTransactions] = await Promise.all([
    getAccountsByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

  const balances = buildBalanceMap(
    accounts,
    existingTransactions.filter((item) => item._id !== transaction._id)
  )
  assertNoNegativeBalances(balances, [
    transaction.accountId,
    transaction.toAccountId,
  ])

  await ctx.db.delete(transaction._id)
}
