import { isEmptyObj } from '@subsocial/utils'
import networks from '../connections/networks'
import { WithApis } from './types'
import { getFromAllNetworks, isApiConnected } from './utils'
import { ApiPromise } from '@polkadot/api'
import { getKintsugiAssetRegistry } from './assetRegistry/kintsugiAssetRegistry'
import { getDefaultAssetRegistry } from './assetRegistry/acalaDefaultRegistry'
import { ONE_HOUR } from '../constant'
import { commonAssetRegistries } from './assetRegistry/common'
import { NetworkBaseInfo } from '../connections/networks/types'
import Cache from '../cache'

type ChainsInfo = Record<string, ChainProperty>
const chainPropertiesCache = new Cache<ChainsInfo>(ONE_HOUR)


export type ChainProperty = NetworkBaseInfo &
  Partial<{
    ss58Format: number
    tokenDecimals: number[]
    tokenSymbols: string[]
    connected: boolean
    assetsRegistry: any
    totalIssuance: string
    existentialDeposit: string
  }>
  
export function getCachedChainProperties (chain: string): ChainProperty | undefined {
  return chainPropertiesCache.get(chain)
}

const customFetchAssetsRegistryByNetwork = {
  interlay: getKintsugiAssetRegistry,
  kintsugi: getKintsugiAssetRegistry,
  basilisk: commonAssetRegistries['assetRegistry.metadataMap'],
  'hydra-dx': commonAssetRegistries['assetRegistry.metadataMap'],
  astar: commonAssetRegistries['assets.metadata'],
  shiden: commonAssetRegistries['assets.metadata'],
  statemine: commonAssetRegistries['assets.metadata'],
  statemint: commonAssetRegistries['assets.metadata'],
  altair: commonAssetRegistries['ormlAssetRegistry.metadata'],
  centrifuge: commonAssetRegistries['ormlAssetRegistry.metadata'],
  shadow: commonAssetRegistries['assets.metadata'],
  pichiu: commonAssetRegistries['assets.metadata'],
  listen: commonAssetRegistries['currencies.listenAssetsInfo'],
  calamari: commonAssetRegistries['assets.metadata'],
  manta: commonAssetRegistries['assets.metadata'],
  moonriver: commonAssetRegistries['assets.metadata'],
  moonbeam: commonAssetRegistries['assets.metadata'],
  turing: commonAssetRegistries['assetRegistry.metadata'],
  parallel: commonAssetRegistries['assets.metadata'],
  parallelHeiko: commonAssetRegistries['assets.metadata'],
  phala: commonAssetRegistries['assets.metadata'],
  khala: commonAssetRegistries['assets.metadata'],

}

const getAssetsRegistry = (network: string) => {
  return customFetchAssetsRegistryByNetwork[network] || getDefaultAssetRegistry
}

const getPropertiesByNetwork = async (api: ApiPromise, network: string): Promise<ChainProperty> => {
  const { icon, name, node, nativeToken, paraId, relayChain, vestingMethod, isEthLike, isTransferable, tokenTransferMethod } = networks[network]

  const baseInfo = {
    icon,
    name,
    node,
    nativeToken,
    paraId,
    relayChain,
    vestingMethod,
    isEthLike,
    isTransferable,
    tokenTransferMethod
  }

  if (api) {
    let existentialDeposit = '0'
    try {
      existentialDeposit = api.consts.balances.existentialDeposit.toString()
    } catch {}

    const r = api.registry

    const [ assetsRegistry, totalIssuance ] = await Promise.all([
      getAssetsRegistry(network)(api),
      api.query.balances?.totalIssuance()
    ])

    return {
      ss58Format: r.chainSS58,
      tokenDecimals: r.chainDecimals,
      tokenSymbols: r.chainTokens,
      connected: isApiConnected(api),
      assetsRegistry,
      existentialDeposit,
      totalIssuance: totalIssuance?.toString(),
      ...baseInfo
    }
  } else {
    return baseInfo
  }
}

export const updatePropertiesByNetwork = async (api: ApiPromise, network: string) => {
  const propertiesByNetwork = await getPropertiesByNetwork(api, network)

  chainPropertiesCache[network] = propertiesByNetwork
}


export const getOrUpdatePropertiesByNetwork = async (api: ApiPromise, network: string) => {
  if(isEmptyObj(chainPropertiesCache[network])) {
    await updatePropertiesByNetwork(api, network)
  }

  return chainPropertiesCache[network]
}

export const getNetworksProperties = async ({ apis }: WithApis) => {
  chainPropertiesCache.set
  return getFromAllNetworks(
    apis, 
    getPropertiesByNetwork, 
    { cache: chainPropertiesCache, needUpdate: chainPropertiesCache.needUpdate }
  )
}
