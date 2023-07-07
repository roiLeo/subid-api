import { ONE_HOUR } from '../../constant/index'
import { ValidatorStakingProperties, ValidatorStakingProps } from './types'
import Cache from '../../cache';

const updateDelay = 7 * 24 * ONE_HOUR
const stakingPropertiesCache = new Cache<Record<string, ValidatorStakingProperties>>('staking-consts', updateDelay)

export const getCurrentEra = async ({ apis, network }: ValidatorStakingProps) => {
  const api = apis[network]

  if (!api) return {}

  const currentEra = await api.query.staking.activeEra()

  return currentEra.toJSON()
}

export const getStakingProps = async ({ apis, network }: ValidatorStakingProps): Promise<Partial<ValidatorStakingProperties>> => {
  const api = apis[network]

  if (!api) return {}

  const needUpdate = stakingPropertiesCache.needUpdate

  const forceUpdate = needUpdate && await needUpdate()
  const cacheData = await stakingPropertiesCache.get(network)

  if (!cacheData || forceUpdate) {

    const bondingDuration = await api.consts.staking.bondingDuration.toJSON()
    const maxNominations = await api.consts.staking.maxNominations.toJSON()
    const historyDepth = await api.consts.staking.historyDepth.toJSON()
    const epochDuration = await api.consts.babe.epochDuration.toJSON()
    const sessionsPerEra = await api.consts.staking.sessionsPerEra.toJSON()
    const maxNominatorRewardedPerValidator = await api.consts.staking.maxNominatorRewardedPerValidator.toJSON()

    const minNominatorBond = await api.query.staking.minNominatorBond()

    const stakingProps = {
      bondingDuration,
      minNominatorBond: minNominatorBond.toJSON(),
      maxNominations,
      historyDepth,
      epochDuration,
      sessionsPerEra,
      maxNominatorRewardedPerValidator
    }

    stakingPropertiesCache.set(network, stakingProps)
  }

  return stakingPropertiesCache.get(network)
}