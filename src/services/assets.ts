import { ApiPromise } from '@polkadot/api'
import { hexToString } from '@polkadot/util'
import { assets } from '../connections/statemine-assets'
import { isDef } from '@subsocial/utils';

type AssetMetadata = {
  deposit: number
  name: string
  symbol: string
  decimals: number
  isFrozen: boolean
}

export const getStatemineAssets = async (api: ApiPromise) => {
  if(!api) return []

  const assetIds = assets.map(({ assetId }) => assetId)

  const [assetsMetadata, assetsDetails] = await Promise.all([
    api.query.assets.metadata.multi(assetIds),
    api.query.assets.asset.multi(assetIds)
  ])

  const result = assetsMetadata.map((metadata, i) => {
    const { name, symbol, isFrozen: isMetaFrozen, ...other } = metadata.toJSON() as AssetMetadata
    const assetDetails = assetsDetails[i].toJSON() as any

    if(!assetDetails) return

    const { isFrozen: isAssetFrozen, ...details } = assetDetails

    return {
      assetId: assetIds[i],
      name: hexToString(name),
      symbol: hexToString(symbol),
      icon: assets[i].icon,
      isMetaFrozen,
      isAssetFrozen,
      ...other,
      ...details
    }
  })

  return result.filter(isDef)
}

export const getStatemineAssetBalancesByAccount = async (api: ApiPromise, account: string) => {
  if(!api) return {}

  const assetIds = assets.map(({ assetId }) => [assetId, account])

  const accountBalancesArr = await api.query.assets.account.multi(assetIds)

  const balances = {}

  accountBalancesArr.forEach((data, i) => {
    const assetId = assets[i].assetId
    balances[assetId] = data.toJSON()
  })

  return balances
}
