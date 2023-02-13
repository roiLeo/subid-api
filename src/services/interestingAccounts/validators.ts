import { MemberDataProps } from '../types'
import { getInterestedAccountsFromSelectedNetwork, needUpdateForRelayChain } from '../utils'
import { ApiPromise } from '@polkadot/api'
import { GenericAccountId } from '@polkadot/types'
import registry from "@subsocial/api/utils/registry";

const validators = {
  polkadot: {},
  kusama: {}
}

const getValidators = async (api: ApiPromise) => {
  if(!api) return []

  const members = await api.query.staking.validators.keys()

  const memberObj = members.map((key) => {
    const addressEncoded = '0x' + key.toHex().substr(-64)
    return { account: new GenericAccountId(registry, addressEncoded)}
  })

  return memberObj
}

export const getValidatorsFromRelayChain = async ({
  apis,
  relayChain,
  offset,
  limit
}: MemberDataProps) => {
  return getInterestedAccountsFromSelectedNetwork(apis, getValidators, relayChain, offset, limit, {
    cache: validators[relayChain],
    needUpdate: () => needUpdateForRelayChain(relayChain)
  })
}
