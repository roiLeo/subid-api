import { WithApis } from "../types"
import { ApiPromise } from '@polkadot/api'
import { FIVE_MINUTES } from "../../constant"
import { newLogger } from '@subsocial/utils'
import { BN } from 'bn.js'

const log = newLogger('Vesting')

type GetCrowdloanClaimableByAccountProps = {
  account: string,
  networks: string[]
  noCache?: boolean
} & WithApis
type VestingData = {
  claimable: string
  remaining: string
}
type MappedVestingData = { [key: string]: VestingData }

const crowdloanVestingCache: {
  // key: `${address}-${networkName}`
  [key: string]: VestingData & { lastUpdate: number }
} = {}
const updateDelay = FIVE_MINUTES
const needUpdate = (lastUpdate: number) => {
  const now = new Date().getTime()
  return now > lastUpdate + updateDelay
}

export const getCrowdloanVestingByAccount = async ({ account, networks, noCache, apis }: GetCrowdloanClaimableByAccountProps): Promise<MappedVestingData> => {
  const promises = networks.map(async (network) => {
    const cacheKey = `${account}-${network}`
    const cacheData = crowdloanVestingCache[cacheKey]
    if (cacheData && !noCache) {
      const { lastUpdate, ...vestingData } = cacheData
      if (!needUpdate(lastUpdate)) return vestingData
    }

    try {
      const api = apis[network] as ApiPromise | undefined
      if (!api) return null

      const balances = await api.derive.balances.all(account)
      const zero = new BN(0)
      const claimable = balances.vestedClaimable || zero
      const total = balances.vestingTotal || zero
      const vested = balances.vestedBalance || zero
      const vestingData = {
        claimable: claimable.toString(),
        remaining: total.sub(vested).add(claimable).toString(),
      }

      crowdloanVestingCache[cacheKey] = {
        ...vestingData,
        lastUpdate: new Date().getTime()
      }

      return vestingData
    } catch (err) {
      log.error(JSON.stringify(err.stack))
      return null
    }
  })
  const results = await Promise.all(promises)

  const mappedResults: MappedVestingData = {}
  results.forEach(async (result, idx) => {
    const network = networks[idx]
    if (!result) return
    mappedResults[network] = result
  })

  return mappedResults
}
