import { WithApis } from '../types'
import { BN } from '@polkadot/util'

import type { ValidatorPrefs, ValidatorPrefsTo196 } from '@polkadot/types/interfaces'

export type ValidatorStakingProperties = {
  bondingDuration: string
  minNominatorBond: string
  maxNominations: string
  historyDepth: string
  epochDuration: string
  sessionsPerEra: string
  maxNominatorRewardedPerValidator: string
}

export type ValidatorStakingProps = WithApis & {
  network: string
}

export type ValidatorStakingWithAccountProps = WithApis & {
  network: string
  account: string
}

export type RewardDestinationKey = 'Staked' | 'Account'

export type RewardDestination = Record<RewardDestinationKey, string | null>

export type Nominators = {
  targets: string[]
  submittedIn: string
  suppressed: boolean
}

export type ValidatorInfo = {
  accountId: string
  bondOther: string
  bondOwn: string
  bondTotal: string
  bondTotalBN: BN
  commissionPer: number
  exposure: any
  isActive: boolean
  isBlocking: boolean
  key: string
  numNominators: number
  validatorPrefs?: ValidatorPrefs | ValidatorPrefsTo196
}