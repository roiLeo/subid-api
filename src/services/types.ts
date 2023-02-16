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

export type SubsocialProfile = {
  content: string
  createdAtBlock: string
  createdAtTime: string
  createdByAccount: Record<'id', string>
  email: string
  name: string
  linksOriginal: string
  hidden: string
  id: string
  updatedAtTime: string
  postsCount: number
  image: string
  tagsOriginal: string
  summary: string
  about: string
  ownedByAccount: Record<'id', string>
  experimental: Record<string, string>
}

export type SubsocialProfilesResult = {
  accounts: Record<'profileSpace', SubsocialProfile>[]
}