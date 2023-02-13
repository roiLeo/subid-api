import { Apis, SupportedNetworks } from '../connections/networks/types'
import { RelayChain } from './crowdloan/types'

export type WithApis = {
  apis: Apis
}

export type MemberDataProps = {
  apis?: Apis
  relayChain: RelayChain
  offset: number
  limit: number
}

export type AllTabDataProps = {
  apis: Apis
  offset: number
  limit: number
  selectedChain: string
}

export type NetworksData = Record<SupportedNetworks, any>

export type GetDataByAccountProps = WithApis & {
  account: string
}