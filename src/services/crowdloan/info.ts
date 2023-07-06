import BN from 'bn.js'
import { ParaId, FundInfo, AccountId, BalanceOf } from '@polkadot/types/interfaces'
import { Option, createType } from '@polkadot/types'
import { ApiPromise } from '@polkadot/api'
import { WithApis } from '../types'
import { parachainsTupleByRelayChain, RelayChain } from './types'
import { stringToU8a, u8aConcat } from '@polkadot/util'
import { ONE_HOUR } from '../../constant'
import { AnyId } from '@subsocial/api/types'
import registry from '@subsocial/api/utils/registry'
import Cache from '../../cache'

const crowdloanInfo = new Cache(ONE_HOUR)

export interface WinnerData {
  accountId: string
  firstSlot: BN
  isCrowdloan: boolean
  key: string
  lastSlot: BN
  paraId: ParaId
  value: BN
}

export interface Campaign extends FundInfo {
  paraId: string
  isCapped?: boolean
  isEnded?: boolean
  isWinner?: boolean
}

export interface LeasePeriod {
  currentPeriod: BN
  length: BN
  progress: BN
  remainder: BN
}

// map into a campaign
function parseFund(
  bestNumber: BN,
  minContribution: BN,
  infoOpt: Option<FundInfo>,
  hasLease: boolean
): Partial<Campaign> {
  const info = infoOpt.unwrapOr<FundInfo>(undefined)

  if (!info) return {}

  const campaing = info.toJSON() as unknown as Campaign

  const { cap, raised, end } = info

  campaing.isCapped = cap.sub(raised).lt(minContribution)
  campaing.isEnded = bestNumber.gt(end)
  campaing.isWinner = hasLease

  return campaing
}

const EMPTY_U8A = new Uint8Array(32)
export const CROWD_PREFIX = stringToU8a('modlpy/cfund')

function createAddress(paraId: ParaId): Uint8Array {
  return u8aConcat(CROWD_PREFIX, paraId.toU8a(), EMPTY_U8A).subarray(0, 32)
}

function isCrowdloadAccount(paraIdStr: AnyId, accountId: AccountId): boolean {
  const paraId: ParaId = createType(registry, 'ParaId', paraIdStr)
  return accountId.eq(createAddress(paraId))
}

const parseLeases = (paraIds: string[], leases: any[]) =>
  paraIds.filter(
    (paraId, i) =>
      leases[i]
        .map((o) => o.unwrapOr(null))
        .filter((v): v is [AccountId, BalanceOf] => !!v)
        .filter(([accountId]) => isCrowdloadAccount(paraId, accountId)).length !== 0
  )

type GetCrowdloanInfoProps = WithApis & {
  relayChain: RelayChain
}

const fetchCrowdloansInfo = async (api: ApiPromise, paraIds: string[]) => {
  const [bestNumber, funds, leases, minContribution] = await Promise.all([
    api.query.system.number(),
    api.query.crowdloan?.funds.multi(paraIds),
    api.query.slots.leases.multi(paraIds),
    api.consts.crowdloan.minContribution
  ])

  const leasesSet = new Set(parseLeases(paraIds, leases))

  return funds.map((fund, i) => {
    const paraId = paraIds[i]
    const info = parseFund(
      bestNumber,
      minContribution as unknown as BN,
      fund as unknown as Option<FundInfo>,
      leasesSet.has(paraId)
    )

    return {
      ...info,
      paraId
    }
  })
}

export const getCrowdloansByRelayChain = async ({ relayChain, apis }: GetCrowdloanInfoProps) => {
  const api = apis[relayChain]

  if (!api) return []

  const parachains = parachainsTupleByRelayChain[relayChain]
  const paraIds = parachains.map(([, { paraId }]) => paraId.toString())

  const needUpdate = crowdloanInfo.needUpdate
  const forceUpdate = needUpdate && needUpdate()

  const cacheData = crowdloanInfo.get(relayChain)

  if (!cacheData || forceUpdate) {
    const data = await fetchCrowdloansInfo(api, paraIds)
    crowdloanInfo.set(relayChain, data)
  }

  return crowdloanInfo.get(relayChain) || []
}
