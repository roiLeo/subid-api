import { MemberDataProps } from '../types'
import { getInterestedAccountsFromSelectedNetwork } from '../utils'
import { ApiPromise } from '@polkadot/api'
import { FIVE_MINUTES } from '../../constant/index'
import Cache from '../../cache'

const councilMembers = new Cache<Record<'polkadot' | 'kusama', any>>('council-members', FIVE_MINUTES)

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
  return getInterestedAccountsFromSelectedNetwork(
    apis,
    getCouncilMembers, 
    relayChain, 
    offset, 
    limit, 
    { cache: councilMembers, needUpdate: councilMembers.needUpdate}
  )
}
