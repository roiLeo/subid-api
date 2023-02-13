import { ApiPromise } from '../../connections/networks/types'
import { getTokensFnByNetwork } from './utils'

export const getBalanceByAccount = async (api: ApiPromise, account: string, network: string) => {
  return getTokensFnByNetwork(network)(api, account, network)
}
