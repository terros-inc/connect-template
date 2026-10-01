import { type AccountUpsertInput, type AccountUpsertSuccess, wrapConnectHandler } from '@terros-inc/sdk'

export type SampleIncomingLeadPayload = {
  externalLeadId: string
  source: string
  firstName: string
  lastName: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
}

type Config = {

}

export const handler = wrapConnectHandler<SampleIncomingLeadPayload, AccountUpsertSuccess, Config>(async (input, client) => {
  const lead = input.context.payload

  if (!lead.externalLeadId) {
    console.log('Incoming lead is missing an externalLeadId, skipping upsert')
    return { type: 'success' }
  }

  const upsertInput: AccountUpsertInput = {
    account: {
      externalLeadId: lead.externalLeadId,
      accountSource: lead.source,
      location: {
        line1: lead.address.street,
        locality: lead.address.city,
        countrySubd: lead.address.state,
        postal1: lead.address.zip,
      },
      resident: {
        firstName: lead.firstName,
        lastName: lead.lastName,
      },
    },
  }

  const result = await client.account.upsert(upsertInput)
  console.log(`Upserted account ${result.account?.accountId} from lead ${lead.externalLeadId}`)
  return result
})
