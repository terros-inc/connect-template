import { TerrosClient } from '@terros-inc/sdk'

export async function handler(): Promise<void> {
  const client = new TerrosClient()
  await client.user.profile()
}
