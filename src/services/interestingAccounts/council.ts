import { MemberDataProps } from '../types'
import { getInterestedAccountsFromSelectedNetwork, needUpdateForRelayChain } from '../utils'
import { ApiPromise } from '@polkadot/api'

const councilMembers = {
  polkadot: {},
  kusama: {}
}

const getCouncilMembers = async (api: ApiPromise) => {
  if(!api) return []

  const members = await api.query.council.members()
  
  const membersObj = (members.toHuman() as any[]).map((account) => {
    return { account }
  })

  return membersObj
}

export const getCouncilMembersByRelayChain = async ({
  apis,
  relayChain,
  offset,
  limit
}: MemberDataProps) => {
  return getInterestedAccountsFromSelectedNetwork(apis, getCouncilMembers, relayChain, offset, limit, {
    cache: councilMembers[relayChain],
    needUpdate: () => needUpdateForRelayChain(relayChain)
  })
}
