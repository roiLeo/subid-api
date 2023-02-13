import { WithApis } from '../types'
import { isDef } from '@subsocial/utils'
import { Apis } from '../../connections/networks/types'

type StakingProps = WithApis & {
  chain: string
}

type StakingCandidatesListProps = StakingProps & {
  accounts: string[]
}

type DelegatorProps = StakingProps & {
  accounts: string[]
}

export const getStakingCandidates = async ({ apis, chain }: StakingProps) => {
  const api = apis[chain]

  if (!api) return []

  const candidates = await api.query.parachainStaking.candidateInfo.keys()

  return candidates.map((candidate) => candidate.toHuman()[0])
}

export const getStakingRound = async ({ apis, chain }: StakingProps) => {
  const api = apis[chain]

  if (!api) return {}

  const round = await api.query.parachainStaking.round()

  return round.toJSON()
}

export const getStakingCandidatesInfo = async ({
  apis,
  chain,
  accounts
}: StakingCandidatesListProps) => {
  const api = apis[chain]

  if (!api) return []

  const candidatesInfo = await api.query.parachainStaking.candidateInfo.multi(accounts)

  const info = candidatesInfo.map((candidateInfo, i) => {
    if(!candidateInfo.toJSON()) return

    return {
      id: `${accounts[i]}-${chain}`,
      ...candidateInfo.toJSON()
    }
  })

  return info.filter(isDef)
}

export const getSelectedCandidates = async ({ apis, chain }: StakingProps) => {
  const api = apis[chain]

  if (!api) return []

  const selectedCandidates = await api.query.parachainStaking.selectedCandidates()

  return selectedCandidates
}

export const getDelegatorState = async ({ apis, chain, accounts }: DelegatorProps) => {
  const api = apis[chain]

  if (!api) return []
  
  const delegatorsState = await api.query.parachainStaking.delegatorState.multi(accounts)

  const state = delegatorsState.map((delegatorState, i) => {

    const delegatorStateJSON = delegatorState.toJSON()

    if(!delegatorStateJSON) return

    return {
      ...delegatorStateJSON,
      id: `${accounts[i]}-${chain}`
    }
  })

  return state.filter(isDef)
}

export const getScheduledRequests = async ({ apis, chain, accounts }: DelegatorProps) => {
  const api = apis[chain]

  if (!api) return []

  const delegationsScheduledRequests = await api.query.parachainStaking.delegationScheduledRequests.multi(accounts)

  const requests = delegationsScheduledRequests.map((delegationScheduledRequests, i) => {
    if(!delegationScheduledRequests.toJSON()) return undefined

    return {
      id: `${accounts[i]}-${chain}`,
      requests: delegationScheduledRequests.toJSON(),
    }
  })

  return requests.filter(isDef)
}

export const getChainConsts = async (apis: Apis, network: string) => {
  const api = apis[network]

  if (!api) return {}

  const minDelegatorStk = await api.consts.parachainStaking.minDelegatorStk.toJSON()
  const minDelegaton = await api.consts.parachainStaking.minDelegation.toJSON()
  const maxDelegationsPerDelegator = await api.consts.parachainStaking.maxDelegationsPerDelegator.toJSON()

  return {
    minDelegatorStk,
    minDelegaton,
    maxDelegationsPerDelegator,
  }
}

