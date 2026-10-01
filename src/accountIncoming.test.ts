import { afterEach, describe, expect, it, vi } from 'vitest'
import { handler, type SampleIncomingLeadPayload } from './accountIncoming.ts'

const runHandler = (payload: SampleIncomingLeadPayload): Promise<{ type: 'success' }> =>
  handler({
    runId: 'ConnectRun.test',
    context: {
      payload,
      config: {
        scriptConfig: {},
        secrets: {},
        authorization: 'test-api-key',
      },
    },
  })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('accountIncoming handler', () => {
  it('upserts an account from an incoming lead payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'success',
          account: { accountId: 'Account.1' },
        })
      )
    )
    vi.stubGlobal('fetch', fetchMock)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await runHandler({
      externalLeadId: 'lead-123',
      source: 'website-form',
      firstName: 'Ada',
      lastName: 'Lovelace',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/account/upsert'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(logSpy).toHaveBeenCalledWith('Upserted account Account.1 from lead lead-123')
  })

  it('skips the upsert when the lead has no externalLeadId', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await runHandler({
      externalLeadId: '',
      source: 'website-form',
      firstName: 'Ada',
      lastName: 'Lovelace',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      },
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith('Incoming lead is missing an externalLeadId, skipping upsert')
  })
})
