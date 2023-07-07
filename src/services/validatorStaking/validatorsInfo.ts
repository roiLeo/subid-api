import { ApiPromise } from '@polkadot/api'
import { ValidatorInfo, ValidatorStakingProps } from './types'
import { BN_ZERO, arrayFlatten, BN } from '@polkadot/util'
import { toGenericAccountId } from '../utils'
import { FIVE_MINUTES, TEN_MILLION } from '../../constant/index'

import type {
  DeriveStakingElected,
  DeriveStakingWaiting,
} from '@polkadot/api-derive/types'
import Cache from '../../cache'

const validatorStakingInfoCache = new Cache<any>('validator-staking-info', FIVE_MINUTES)

/// https://github.dev/polkadot-js/apps/blob/fb8f7fe86b2945fcc71dcd11c67ebeeab35ee37e/packages/page-staking/src/useSortedTargets.ts#L120-L121
const parseValidatorStakingInfo = (
  api: ApiPromise,
  derive: DeriveStakingElected | DeriveStakingWaiting
): [ValidatorInfo[], Record<string, BN>] => {
  const nominators: Record<string, BN> = {}
  const emptyExposure = api.createType('Exposure')
  const list = new Array<ValidatorInfo>(derive.info.length)

  for (let i = 0; i < derive.info.length; i++) {
    const { accountId, exposure = emptyExposure, stakingLedger, validatorPrefs } = derive.info[i]

    let [bondOwn, bondTotal] = exposure.total
      ? [exposure.own.unwrap(), exposure.total.unwrap()]
      : [BN_ZERO, BN_ZERO]

    const skipRewards = bondTotal.isZero()

    if (skipRewards) {
      bondTotal = bondOwn = stakingLedger.total?.unwrap() || BN_ZERO
    }

    const key = accountId.toString()

    const { own, total, others } = exposure || {}

    const otherObj: Record<string, string> = {}

    others?.forEach((indv) => {
      const nominator = toGenericAccountId(indv.who.toString())

      otherObj[nominator] = indv.value.toString()

      nominators[nominator] = (nominators[nominator] || BN_ZERO).add(indv.value?.toBn() || BN_ZERO)
    })

    list[i] = {
      accountId: accountId.toString(),
      bondOther: bondTotal.sub(bondOwn).toString(),
      bondOwn: bondOwn.toString(),
      bondTotal: bondTotal.toString(),
      bondTotalBN: bondTotal,
      commissionPer: validatorPrefs.commission.unwrap().toNumber() / TEN_MILLION,
      exposure: {
        own: own?.toString(),
        total: total?.toString(),
        others: otherObj
      } as any,
      isActive: !skipRewards,
      isBlocking: !!(validatorPrefs.blocked && validatorPrefs.blocked.isTrue),
      key,
      numNominators: (exposure.others || []).length,
      validatorPrefs
    }
  }

  return [list, nominators]
}

/// https://github.dev/polkadot-js/apps/blob/fb8f7fe86b2945fcc71dcd11c67ebeeab35ee37e/packages/page-staking/src/useSortedTargets.ts#L120-L121
function mergeValidatorsInfo(
  api: ApiPromise,
  electedDerive: DeriveStakingElected,
  waitingDerive: DeriveStakingWaiting
) {
  const [elected, nominators] = parseValidatorStakingInfo(api, electedDerive)
  const [waiting] = parseValidatorStakingInfo(api, waitingDerive)
  const activeTotals = elected
    .filter(({ isActive }) => isActive)
    .map(({ bondTotalBN }) => bondTotalBN)
    .sort((a, b) => new BN(a).cmp(new BN(b)))
  const totalStaked = activeTotals.reduce((total: BN, value: BN) => total.iadd(value), new BN(0))
  const avgStaked = totalStaked.divn(activeTotals.length)

  const minNominated = Object.values(nominators).reduce((min: BN, value: BN) => {
    return min.isZero() || value.lt(min) ? value : min
  }, BN_ZERO)

  const validators = arrayFlatten([elected, waiting])

  const validatorsObj: Record<string, ValidatorInfo> = {}

  validators.forEach((validator) => {
    validatorsObj[toGenericAccountId(validator.accountId.toString())] = validator
  })

  const commValues = validators.map(({ commissionPer }) => commissionPer).sort((a, b) => a - b)
  const midIndex = Math.floor(commValues.length / 2)
  const medianComm = commValues.length
    ? commValues.length % 2
      ? commValues[midIndex]
      : (commValues[midIndex - 1] + commValues[midIndex]) / 2
    : 0

  const waitingIds = waiting.map(({ key }) => key)
  const validatorIds = arrayFlatten([elected.map(({ key }) => key), waitingIds])
  const nominateIds = arrayFlatten([
    elected.filter(({ isBlocking }) => !isBlocking).map(({ key }) => key),
    waiting.filter(({ isBlocking }) => !isBlocking).map(({ key }) => key)
  ])

  return {
    avgStaked: avgStaked.toString(),
    lowStaked: (activeTotals[0] || BN_ZERO).toString(),
    medianComm,
    minNominated: minNominated.toString(),
    nominateIds,
    nominators: Object.keys(nominators),
    totalStaked: totalStaked.toString(),
    validatorIds,
    validators: validatorsObj,
    waitingIds
  }
}

export const getValidatorsData = async (api: any, network: string) => {
  const cacheData = await validatorStakingInfoCache.get(network)

  if(cacheData?.loading) return

  await validatorStakingInfoCache.set(network, {
    ...cacheData,
    loading: true
  })
  
  const electedInfo = await api.derive.staking.electedInfo()
  const waitingInfo = await api.derive.staking.waitingInfo()
  const activeEra = await api.query.staking.activeEra()

  const era = activeEra.toJSON().index

  const baseInfo = mergeValidatorsInfo(api, electedInfo, waitingInfo)

  const info = {
    era,
    ...baseInfo
  }

  await validatorStakingInfoCache.set(network, {
    info,
    loading: false
  })
}

export const getValidatorsList = async ({ apis, network }: ValidatorStakingProps) => {
  const api = apis[network]

  if (!api) return []

  const needUpdate = validatorStakingInfoCache.needUpdate

  const forceUpdate = needUpdate && await needUpdate()
  const cacheData = await validatorStakingInfoCache.get(network)

  if (!cacheData || forceUpdate) {
    getValidatorsData(api, network)
  }

  const validatorStakingInfo = await validatorStakingInfoCache.get(network)

  return validatorStakingInfo?.info || {}
}