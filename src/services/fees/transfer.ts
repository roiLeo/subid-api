import { ChainName, FN } from '@polkawallet/bridge'
import { ApiPromise, Apis } from '../../connections/networks/types'
import { getCrossChainAdapter } from './utils'
import { firstValueFrom } from 'rxjs'
import { getCachedChainProperties } from '../properties'
import { callMethodString } from '../../utils'

type TransferFeeData = { token: string; amount: string }

const encodeParamToId = (param: GetTransferFeeParam) => `${param.token}-${param.from}-${param.to}`
const transferFeeCache: Record<string, TransferFeeData> = {}

const dummyAccount = '5EZVynPKXVgRW3pgmB5whqoFwEa94USMVyh68DexVJMNyR3p'
export type GetTransferFeeParam = {
  token: string
  from: string
  to?: string
}
export async function getTransferFee (apis: Apis, params: GetTransferFeeParam): Promise<TransferFeeData> {
  const { from, to, token } = params
  const cacheData = transferFeeCache[encodeParamToId(params)]
  if (cacheData) return cacheData

  let chainProperty = await getCachedChainProperties(from)
  const nativeToken = chainProperty?.nativeToken || chainProperty?.tokenSymbols?.[0]

  const api = apis[from as keyof Apis]

  let amount = '0'
  if (api) {
    if (!to) {
      amount = await getInternalTransferFee(api, { from, token })
    } else {
      amount = await getCrossChainTransferFee({ from, to, token }, chainProperty.node)
    }
  }

  transferFeeCache[encodeParamToId(params)] = { amount, token: nativeToken }
  return { amount, token: nativeToken }
}

async function getInternalTransferFee (api: ApiPromise, { from, token }: GetTransferFeeParam) {
  let chainProperty = await getCachedChainProperties(from)
  const assetsRegistry = chainProperty?.assetsRegistry
  const nativeToken = chainProperty?.nativeToken || chainProperty?.tokenSymbols?.[0]
  const isNativeToken = nativeToken === token

  try {
    if (isNativeToken) {
      const paymentInfo = await api.tx.balances.transfer(dummyAccount, '0').paymentInfo(dummyAccount)
      return paymentInfo?.toPrimitive()?.partialFee?.toString()
    } else {
      const tokenId = assetsRegistry[token]?.currency
      const tokenTransferMethod = chainProperty.tokenTransferMethod
      if (!tokenId || !tokenTransferMethod) return '0'

      const paymentInfo = await callMethodString(tokenTransferMethod, api.tx, {
        recipient: dummyAccount,
        amount: '0',
        id: tokenId
      })?.paymentInfo(dummyAccount)
      return paymentInfo?.toPrimitive()?.partialFee?.toString()
    }
  } catch (e) {
    console.warn(`Error getting internal transfer fee for token ${token} in ${from} network`, e)
    return '0'
  }
}

async function getCrossChainTransferFee ({ from, token, to }: GetTransferFeeParam, node: string) {
  let amount = '0'

  try {
    const adapter = await getCrossChainAdapter(from, node)
    if (!adapter) return amount
    amount = await firstValueFrom(adapter.estimateTxFee({
      to: to as ChainName,
      address: dummyAccount,
      amount: FN.ZERO,
      signer: dummyAccount,
      token
    }))
  } catch (e) {
    console.warn(`Error getting cross chain transfer fee for token ${token} from ${from} network to ${to}`, e)
  }

  return amount
}
