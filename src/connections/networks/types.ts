import { ApiPromise, HttpProvider } from '@polkadot/api';
import { WsProvider } from '@polkadot/api'
import { RelayChain } from '../../services/crowdloan/types'

type GetApiFnProps = {
  provider: WsProvider | HttpProvider
  types: any
}

export type GetApiFn = (props: GetApiFnProps) => ApiPromise

export type NetworkBaseInfo = {
  node: string
  wsNode?: string
  icon: string
  name: string
  isEthLike?: boolean
  paraId?: number
  relayChain?: RelayChain
  vestingMethod?: string
  isTransferable?: boolean
  tokenTransferMethod?: string
  nativeToken?: string
}

/**
 * "node" is used for getting data from the parachain, like balances.
 * crowdloan info is fetched without the need of "node", so to add crowdloan info only, "node" can be omitted
 */
export type Network = NetworkBaseInfo & {
  types?: any
  getApi?: GetApiFn
  disabled?: boolean
  [key: string]: any
}

export type SupportedNetworks =
  | 'subsocial'
  | 'kusama'
  | 'polkadot'
  | 'shiden'
  | 'statemine'
  | 'karura'
  | 'subsocialParachain'
  | 'acala'
  | 'quartz'

/**
 * @see Network for Network attribute
 */
export type Networks = Record<string, Network>
export type Apis = Record<SupportedNetworks, ApiPromise>
export * from '@polkadot/api'