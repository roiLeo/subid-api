import { u8aToHex } from '@polkadot/util'
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'
import { newLogger } from '@subsocial/utils'
import { gql } from 'graphql-request'
import { ApiPromise } from '../../connections/networks/types'
import { WithApis } from '../types'
import { isApiConnected } from '../utils'
import { parachainsTupleByRelayChain, RelayChain } from './types'
import { contributionsClientByRelay } from '../../constant/graphQlClients'

const log = newLogger('CrowdloanContributions')

type GetBalancesByIdProps = WithApis & {
  account: string,
  relayChain: RelayChain
}

const getContributionsByAccountQuery = gql`
  query GetContributionsByAccount($account: String!) {
    contributions(
      where: {account: {id_eq: $account}}
      orderBy: crowdloan_createdAt_ASC
      limit: 100
    ) {
      id
      amount
      crowdloan {
        firstPeriod
        lastPeriod
        parachainId
      }
    }
  }
`

type GetContributionsByAccountInNetworkProps = {
  account: string,
  chainSS58?: number,
  relayChain: RelayChain
}

type ContributionsData = {
  amount: string
  crowdloan: {
    firstPeriod: number
    lastPeriod: number
    parachainId: string
  }
}

type ContributionsResult = { contributions: ContributionsData[] }

export const getContributionsByAccountInNetwork = async ({ account, chainSS58, relayChain }: GetContributionsByAccountInNetworkProps) => {
  try {
    const { addressPrefix, client } = contributionsClientByRelay[relayChain] || {}
    const variables = {
      account: encodeAddress(account, chainSS58 || addressPrefix),
    }

    const result: ContributionsResult = await client.request(getContributionsByAccountQuery, variables)
    const contributions = {}
    result.contributions.forEach(({ amount, crowdloan: { parachainId, firstPeriod, lastPeriod }}) => {
      contributions[parachainId] = {
        firstPeriod,
        lastPeriod,
        contribution: amount.toString()
      }
    })
  
    return contributions
  } catch (err) {
    log.error(err)
    return {}
  }
}

export type LeaseInfo = {
  leaseStart: number
  leaseEnd: number
}
const createLeaseInfoCache = () => {
  const leaseInfoCache: { [network in RelayChain]?: { [startAndEnd: string]: LeaseInfo } } = {}

  const getKey = (start: number, end: number) => `${start}-${end}`
  return {
    set: (relayChain: RelayChain, start: number, end: number, leaseInfo: LeaseInfo) => {
      const key = getKey(start, end)
      if (!leaseInfoCache[relayChain]) {
        leaseInfoCache[relayChain] = {}
      }
      leaseInfoCache[relayChain][key] = leaseInfo
    },
    get: (relayChain: RelayChain, start: number, end: number) => {
      return leaseInfoCache[relayChain]?.[getKey(start, end)]
    }
  }
}
const leaseInfoCache = createLeaseInfoCache()
export const getCrowdloanLeaseInfo = async (relayChain: RelayChain, api: ApiPromise, leasePeriod: { start: number, end: number }) => {
  try {
    const cachedLeaseInfo = leaseInfoCache.get(relayChain, leasePeriod.start, leasePeriod.end)
    if (cachedLeaseInfo) return cachedLeaseInfo
    if (!api) return undefined

    const { start, end } = leasePeriod
    const bestNumberString = (await api.query.system.number()).toString()
    const bestNumber = parseInt(bestNumberString)
    const currentTimestampString = (await api.query.timestamp.now()).toPrimitive().toString()
    const currentTimestamp = parseInt(currentTimestampString)

    const ONE_BLOCK_TO_TIMESTAMP = 6000
    const getTimestampFromBlock = (block: number) => {
      const differenceBlock = bestNumber - block
      const timestampDiff = differenceBlock * ONE_BLOCK_TO_TIMESTAMP
      return currentTimestamp - timestampDiff
    }

    const periodLengthInBlock = api.consts.slots.leasePeriod.toPrimitive() as number
    const offsetInBlock = api.consts.slots.leaseOffset.toPrimitive() as number
  
    const startBlock = start * periodLengthInBlock + offsetInBlock
    const startBlockTimestamp = getTimestampFromBlock(startBlock)
    const leaseDurationInPeriod = end - start + 1 // because the length includes the start number

    const leaseInfo = {
      leaseStart: startBlockTimestamp,
      leaseEnd: startBlockTimestamp + (leaseDurationInPeriod * periodLengthInBlock * ONE_BLOCK_TO_TIMESTAMP)
    }
    leaseInfoCache.set(relayChain, start, end, leaseInfo)
    return leaseInfo
  } catch {
    return undefined
  }
}

export const getCrowdloanContributionsByAccount = async (
  api: ApiPromise,
  paraId: number,
  account: string
) => {
  if (!isApiConnected(api)) return undefined

  try {
    const myAccountHex = u8aToHex(decodeAddress(account))
    const crowdloan = await api.derive.crowdloan.ownContributions(paraId, [myAccountHex])

    return crowdloan[myAccountHex]
  } catch (err) {
    log.error(err)
    return undefined
  }
}

export const getCrowdloansContributionsByAccountInNetwork = async ({
  account,
  apis,
  relayChain
}: GetBalancesByIdProps) => {
  const relayApi = apis[relayChain]
  const contributions = await getContributionsByAccountInNetwork({ chainSS58: relayApi?.registry?.chainSS58, account, relayChain })
  const processorMap = parachainsTupleByRelayChain[relayChain].map(async ([network, { paraId }]) => {
    const pId = paraId.toString()
    const contribution = contributions[pId]
    let leaseInfo: Awaited<ReturnType<typeof getCrowdloanLeaseInfo>> = undefined
    const crowdloanFirstPeriod: number = contribution?.firstPeriod
    const crowdloanLastPeriod: number = contribution?.lastPeriod
    if (crowdloanFirstPeriod && crowdloanLastPeriod) {
      leaseInfo = await getCrowdloanLeaseInfo(relayChain, relayApi, { start: crowdloanFirstPeriod, end: crowdloanLastPeriod })
    }

    // TODO: resolve render all crowdloans on UI and return this checking
    // if (contribution?.contribution) {
    contributions[pId] = {
      ...contribution,
      ...leaseInfo,
      network
    }
    // }
  })

  await Promise.all(processorMap)
  return contributions
}