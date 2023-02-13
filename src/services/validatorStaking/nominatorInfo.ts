import { ApiPromise } from '@polkadot/api'
import { startWithUpperCase } from '../../utils'
import { ValidatorStakingWithAccountProps, Nominators, RewardDestination } from './types';
import { toGenericAccountId } from '../utils';

const getRewardDestinationData = (rewardDestination: RewardDestination) => {
  /// Reward destination has only one value in the entries, so we extract the first element from it
  const [ key, value ] = Object.entries(rewardDestination)[0]

  return {
    rewardDestinationKey: key,
    addressOrNull: value
  }
}

export const getNominatorInfo = async ({ apis, network, account }: ValidatorStakingWithAccountProps) => {
  const api = apis[network] as ApiPromise

  if (!api) return []

  const controller = await api.query.staking.bonded(account)

  const controllerId = controller.toHuman()

  const [ payee, ledger, nominators ] = await api.queryMulti([
    [api.query.staking.payee, account],
    [api.query.staking.ledger, controllerId],
    [api.query.staking.nominators, account]
  ])

  const rewardDestination = payee.toJSON() as RewardDestination

  const { rewardDestinationKey, addressOrNull } = getRewardDestinationData(rewardDestination)

  const nominatorsHuman = nominators?.toJSON() as any

  return {
    accountId: account,
    controllerId: controllerId,
    stakingLedger: ledger?.toJSON(),
    rewardDestination: { [startWithUpperCase(rewardDestinationKey)]: toGenericAccountId(addressOrNull) || null },
    nominators: nominatorsHuman?.targets || [],
    ...nominatorsHuman
  }
}

export const getController = async ({ apis, network, account }: ValidatorStakingWithAccountProps) => {
  const api = apis[network] as ApiPromise

  if (!api) return undefined

  const controller = await api.query.staking.bonded(account)

  if(!controller) return undefined

  return controller
}

export const getRewardDestination = async ({ apis, network, account }: ValidatorStakingWithAccountProps) => {
  const api = apis[network] as ApiPromise

  if (!api) return undefined

  const payee = await api.query.staking.payee(account)

  if(!payee) return undefined

  const rewardDestination = payee.toJSON() as RewardDestination

  const { rewardDestinationKey, addressOrNull } = getRewardDestinationData(rewardDestination)

  return { [startWithUpperCase(rewardDestinationKey)]: toGenericAccountId(addressOrNull) || null }
}

export const getStakingLegder = async ({ apis, network, account }: ValidatorStakingWithAccountProps) => {
  const api = apis[network] as ApiPromise

  if (!api) return undefined

  const ladger = await api.query.staking.ledger(account)

  if(!ladger) return undefined

  return ladger
}

export const getNominators = async ({ apis, network, account }: ValidatorStakingWithAccountProps) => {
  const api = apis[network] as ApiPromise

  if (!api) return undefined

  const nominators = await api.query.staking.nominators(account)

  if(!nominators) return undefined

  const nominatorsHuman = nominators.toJSON() as Nominators

  return nominatorsHuman?.targets || []
}