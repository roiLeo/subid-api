import { ApiPromise, GetApiFn } from './types'
import { options } from '@bifrost-finance/api'
import { ONFINALITY_API_KEY } from '../../constant'

export const getBitfrostApi: GetApiFn = ({ provider }) => new ApiPromise(options({ provider }))

export const resolveOnfinalityUrl = (chainName: string) => 
  `wss://${chainName}.api.onfinality.io/ws?apikey=${ONFINALITY_API_KEY}`