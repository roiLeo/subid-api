import { AllTabDataProps, MemberDataProps } from '../types'
import polkadotJSON from '../../../public/contributions/polkadot-contributors.json'
import kusamaJSON from '../../../public/contributions/polkadot-contributors.json'
import { getValidatorsFromRelayChain } from './validators'
import { getCouncilMembersByRelayChain } from './council'
import { RelayChain, relayChains } from '../crowdloan/types'
import { Apis } from '../../connections/networks/types'
import { sampleSize } from 'lodash'

const contributions = {
  polkadot: polkadotJSON,
  kusama: kusamaJSON
}

type ContributionsByRelayChainProps = {
  offset: number
  limit: number
  relayChain: RelayChain
}

type AccountMetaData = {
  account: string
  amount: string
}

const addMetaData = (data: AccountMetaData[], type: string, relayChain: string): any[] => {
  return data?.map(({ account, amount }) => ({ account, amount, relayChain, type }))
}

type GetDataFn = (props: MemberDataProps) => any

const allAccountsTypes = ['council', 'validator', 'crowdloaner']

const getContributionsByRelayChian = ({ offset, limit, relayChain }: ContributionsByRelayChainProps) => {
  const contributionsByRelayChain = contributions[relayChain]

  const contributionsEntries = Object.entries(contributionsByRelayChain)

  const contributionsSlice = contributionsEntries.slice(offset, offset + limit)

  return contributionsSlice.map(([contribution, amount]) => {
    return { account: contribution, amount }
  })
}

const fetchDataByType: Record<string, GetDataFn> = {
  council: getCouncilMembersByRelayChain,
  validator: getValidatorsFromRelayChain,
  crowdloaner: getContributionsByRelayChian
}

export const getAccountsOverviewItems = async (apis: Apis) => {
  const allAccountsPromise = allAccountsTypes.map(async (dataType) => {
    const getDataFn = fetchDataByType[dataType]

    const itemsCount = dataType !== 'council' ? 1 : 2

    const dataByRelayChainsPromise = relayChains.map(async (relayChain) => {
      const data = await getDataFn({
        apis,
        offset: 0,
        limit: 20,
        relayChain: relayChain as RelayChain
      })

      return sampleSize(addMetaData(data, dataType, relayChain), itemsCount)
    })

    const dataByRelayChain = await Promise.all(dataByRelayChainsPromise)

    return dataByRelayChain.flat()
  })

  const allAccounts = await Promise.all(allAccountsPromise)

  return allAccounts.flat()
}

export const getAllTabData = async ({ apis, offset, limit, selectedChain }: AllTabDataProps) => {
  const allAccountsPromise = allAccountsTypes.map(async (dataType) => {
    const getDataFn = fetchDataByType[dataType]

    if (selectedChain === 'all') {
      const dataByRelayChainsPromise = relayChains.map(async (relayChain) => {
        const data = await getDataFn({ apis, offset, limit, relayChain: relayChain as RelayChain })

        return addMetaData(data, dataType, relayChain)
      })

      const dataByRelayChain = await Promise.all(dataByRelayChainsPromise)

      return dataByRelayChain.flat()
    } else {
      const data = await getDataFn({ apis, offset, limit, relayChain: selectedChain as RelayChain })

      return addMetaData(data, dataType, selectedChain)
    }
  })

  const allAccounts = await Promise.all(allAccountsPromise)

  return allAccounts.flat()
}

export const getAllAccountsLength = async (apis: Apis) => {
  const allAccounts = await getAllTabData({ apis, offset: 0, limit: -1, selectedChain: 'all' })

  return allAccounts.length + 1
}
