import { ValidatorStakingWithAccountProps } from './types'
import axios from 'axios'
import { VALIDATOR_STAKING_REWARDS_API_KEY } from '../../constant/index';

const subscanApiByNetwork: Record<string, string> = {
  polkadot: 'https://polkadot.api.subscan.io/api/v2/scan/account/reward_slash',
  kusama: 'https://kusama.api.subscan.io/api/v2/scan/account/reward_slash'
}

export const getRewardsByNominator = async ({ network, account }: ValidatorStakingWithAccountProps) => {
  const apiUrl = subscanApiByNetwork[network]
  
  if(!apiUrl) return

  try {
		const res = await axios.post(
			apiUrl,
      {
        row: 10,
        page: 0,
        address: account,
        category: "Reward",
        is_stash: true
      },
      {
        headers: {
          'X-API-Key': VALIDATOR_STAKING_REWARDS_API_KEY
        }
      }
		)
		if (res.status !== 200) {
			console.warn(`Failed to get validator staking rewards by nominator for ${network}`)
		}
		return res.data?.data?.list?.[0]
	} catch (err) {
		console.error(`Failed to get validator staking rewards by nominator for ${network}`, err)
		return
	}
}