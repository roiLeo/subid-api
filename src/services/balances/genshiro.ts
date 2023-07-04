import { SignedBalance } from '@equilab/api/genshiro/interfaces'
import {
  u64FromCurrency as u64FromAsset,
  currencyFromU64 as assetFromU64
} from '@equilab/api/genshiro/util'
import { ApiPromise } from '@polkadot/api'
import { Option } from '@polkadot/types'
import { KeyringPair } from '@polkadot/keyring/types'
import { parseBalances, TokenBalances } from './utils'
import { BN } from '@polkadot/util'

function getAccountBalance(
  api: ApiPromise,
  acc: string | KeyringPair,
  asset: string
): Promise<SignedBalance> {
  const accountArg = typeof acc === 'string' ? acc : acc.address
  return api.query.eqBalances.account(accountArg, {
    '0': u64FromAsset(asset)
  }) as unknown as Promise<SignedBalance>
}

function convertBalance(signedBalance: SignedBalance): string {
  return signedBalance.isNegative
    ? signedBalance.asNegative.toBn().neg().toString()
    : signedBalance.asPositive.toBn().toString()
}

export async function getGenshiroTokens(
  api: ApiPromise,
  accountId: KeyringPair | string
): Promise<TokenBalances> {
  const assetsOptCodec = await api.query.eqAssets.assets()

  const assets = (assetsOptCodec as Option<any>)
    .unwrap()
    .map((a) => assetFromU64(parseInt(a.id[0].toString(), 10)).toUpperCase())

  const balancesArr: SignedBalance[] = await Promise.all(assets.map((a) => 
    getAccountBalance(api, accountId, a)))

  const balances: TokenBalances = {}

  balancesArr.forEach((signedBalance, i) => {
    balances[assets[i]] = parseBalances(new BN(convertBalance(signedBalance)))
  })

  return balances
}
