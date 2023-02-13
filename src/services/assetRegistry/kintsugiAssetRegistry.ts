import { ApiPromise } from '@polkadot/api'

export const getKintsugiAssetRegistry = async (api: ApiPromise): Promise<Record<string, any>> => {
  try {
    const assetsRegistryFromStorage = await api.query.assetRegistry.metadata.entries()
    const assetRegistry = {}

    assetsRegistryFromStorage.forEach(assetsRegistry => {
      const [ currency, currencyData ] = assetsRegistry

      const { name, decimals, symbol } = currencyData.toPrimitive() as any

      assetRegistry[symbol] = {
        currency: {
          ForeignAsset: currency.toPrimitive()[0]
        },
        name,
        decimals,
        symbol
      }
    })

    return assetRegistry
  } catch {
    return {}
  }
}