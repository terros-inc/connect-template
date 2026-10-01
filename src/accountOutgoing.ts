import { type AccountData, type UserGetSuccess, type WebhookPayload, wrapConnectHandler } from '@terros-inc/sdk'

export type AccountWebhook = WebhookPayload<'Account', AccountData, 'accountId'>

export const handler = wrapConnectHandler<AccountWebhook>(async (input, client) => {
  const { payload } = input.context

  if (payload.action === 'remove') {
    console.log(`Account ${payload.data} was removed`)
    return
  }

  const account = payload.data

  if (!account.ownerId) {
    console.log(`Account ${account.accountId} has no owner`)
    return
  }

  const { user } = await client.call<UserGetSuccess>('user/get', { userId: account.ownerId })
  console.log(`Account ${account.accountId} is owned by ${user.firstName} ${user.lastName}`)
})
