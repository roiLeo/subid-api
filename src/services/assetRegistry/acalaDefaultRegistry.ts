import { ApiPromise } from '@polkadot/api'

export const getDefaultAssetRegistry = async (api: ApiPromise): Promise<Record<string, any>> => {
  try {
    const assetsRegistryFromStorage = await api.query.assetRegistry.assetMetadatas.entries()
    const assetRegistry = {}

    assetsRegistryFromStorage.forEach(assetsRegistry => {
      const [currency, currencyData] = assetsRegistry
      const currencyDataHuman = currencyData.toPrimitive() as any

      const currencyHuman = currency.toHuman()[0]
      const [currencyKey] = Object.keys(currencyHuman)

      let currencyValue = {}

      switch (currencyKey) {
        case 'NativeAssetId': {
          currencyValue = currencyHuman?.NativeAssetId
          break
        }
        case 'ForeignAssetId': {
          currencyValue = { ForeignAsset: currencyHuman.ForeignAssetId }
          break
        }
        case 'StableAssetId': {
          currencyValue = { StableAssetPoolToken: currencyHuman.StableAssetId }
          break
        }
        default: {
          currencyValue = currencyHuman
        }
      }

      assetRegistry[currencyDataHuman.symbol] = {
        currency: currencyValue,
        ...currencyDataHuman
      }
    })

    return assetRegistry
  } catch {
    return {}
  }
}