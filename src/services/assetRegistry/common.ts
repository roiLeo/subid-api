import { ApiPromise } from '@polkadot/api'

export const commonAssetRegistries = {
  'assets.metadata': generateCommonAssetRegistry([ 'assets', 'metadata' ]),
  'assetRegistry.metadataMap': generateCommonAssetRegistry([ 'assetRegistry', 'assetMetadataMap' ]),
  'ormlAssetRegistry.metadata': generateCommonAssetRegistry([ 'ormlAssetRegistry', 'metadata' ]),
  'currencies.listenAssetsInfo': generateCommonAssetRegistry([ 'currencies', 'listenAssetsInfo' ], (data) => data.metadata),
  'assetRegistry.metadata': generateCommonAssetRegistry([ 'assetRegistry', 'metadata' ])
}

function defaultCurrencyDataGetter (data: any) {
  return { decimals: data.decimals as number, symbol: data.symbol as string }
}
export default function generateCommonAssetRegistry (
  getterMethod: [string, string],
  currencyDataGetter = defaultCurrencyDataGetter
) {
  return async (api: ApiPromise): Promise<Record<string, any>> => {
    try {
      const [ palletName, storageName ] = getterMethod
      const assetsRegistryFromStorage = await api.query[palletName][storageName].entries()
      const assetRegistry = {}

      assetsRegistryFromStorage.forEach(assetsRegistry => {
        const [ currency, currencyData ] = assetsRegistry
        const { decimals, symbol } = currencyDataGetter(currencyData.toPrimitive())

        let currencyHuman = currency.toHuman()[0]
        if (typeof currencyHuman === 'string') {
          currencyHuman = currencyHuman.replace(/,/g, '')
        }
        assetRegistry[symbol] = {
          currency: currencyHuman,
          decimals,
          symbol
        }
      })

      return assetRegistry
    } catch {
      return {}
    }
  }
}