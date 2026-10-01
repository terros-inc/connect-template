import { afterEach, describe, expect, it, vi } from 'vitest'
import { type AccountWebhook, handler } from './accountOutgoing.ts'

const runHandler = (payload: AccountWebhook): Promise<void> =>
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

describe('accountOutgoing handler', () => {
  it('looks up and logs the account owner', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'success',
          user: { userId: 'U:1', firstName: 'Ada', lastName: 'Lovelace' },
        })
      )
    )
    vi.stubGlobal('fetch', fetchMock)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await runHandler({
      entity: 'Account',
      action: 'update',
      data: {
        accountId: 'Account.1',
        ownerId: 'U:1',
        state: 'active',
        statusHistory: [],
      } as never,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/user/get'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(logSpy).toHaveBeenCalledWith('Account Account.1 is owned by Ada Lovelace')
  })

  it('logs when the account has no owner', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await runHandler({
      entity: 'Account',
      action: 'add',
      data: {
        accountId: 'Account.2',
        state: 'active',
        statusHistory: [],
      } as never,
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith('Account Account.2 has no owner')
  })

  it('logs when the account is removed', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await runHandler({
      entity: 'Account',
      action: 'remove',
      data: 'Account.3' as never,
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith('Account Account.3 was removed')
  })
})
