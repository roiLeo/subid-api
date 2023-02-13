import { ONE_HOUR } from '../../constant/index'
import { newLogger } from '@subsocial/utils'
import { ValidatorStakingProperties, ValidatorStakingProps } from './types';

const stakingPropertiesCache: Record<string, ValidatorStakingProperties> = {}

const log = newLogger('Get validator staking props')

let lastUpdate = new Date().getTime()

const updateDelay = 7 * 24 * ONE_HOUR

const needUpdate = () => {
  const now = new Date().getTime()

  if (now > lastUpdate + updateDelay) {
    log.debug('Update validator staking props')
    lastUpdate = now
    return true
  }

  return false
}

export const getCurrentEra = async ({ apis, network }: ValidatorStakingProps) => {
  const api = apis[network]

  if (!api) return {}

  const currentEra = await api.query.staking.activeEra()

  return currentEra.toJSON()
}

export const getStakingProps = async ({ apis, network }: ValidatorStakingProps): Promise<Partial<ValidatorStakingProperties>> => {
  const api = apis[network]

  if (!api) return {}

  const forceUpdate = needUpdate && needUpdate()
  const cacheData = stakingPropertiesCache[network]

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

    stakingPropertiesCache[network] = stakingProps
  }

  return stakingPropertiesCache[network]
}