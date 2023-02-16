import { Apis } from "../connections/networks/types"
import { isEmptyObj } from '@subsocial/utils'
import { ApiPromise } from '@polkadot/api'
import { GenericAccountId } from '@polkadot/types'
import { isEthereumAddress } from '@polkadot/util-crypto'
import { SubsocialApi } from "@subsocial/api"
import { newLogger, nonEmptyArr } from "@subsocial/utils"
import networks from "../connections/networks"
import axios from "axios"
import { RelayChain } from "./crowdloan/types"
import { FIVE_MINUTES } from "../constant"
import registry from "@subsocial/api/utils/registry";

type ApiFn<T> = (api: ApiPromise) => Promise<T>
type ApiWithNetworkFn<T> = (api: ApiPromise, network: string) => Promise<T>

type Properties<T = any> = {
  cache: Record<string, T>,
  needUpdate?: () => boolean
}

const log = newLogger('UTILS')


export const isValidAddress = (address?: string) => {
  try {
    if (isEthereumAddress(address)) return true

    const genericAddress = new GenericAccountId(registry, address)
    return !!genericAddress
  } catch {
    return false
  }
}

export const toGenericAccountId = (account?: string) =>
  account && isValidAddress(account)
    ? new GenericAccountId(registry, account).toString()
    : ''

  export async function getFromSelectedNetwork<T = any>(apis: Apis, getData: ApiFn<T>, network: RelayChain, props?: Properties<T>) {
    if (!props) {
      props = {
        cache: {}
      }
    }
  
    const { cache, needUpdate } = props
  
    const forceUpdate = (needUpdate && needUpdate())
  
    const cacheData = cache
  
    if (isEmptyObj(cacheData) || forceUpdate) {
      try {
        cache[network] = await getData(apis[network])
      } catch (err) {
        log.warn(getFromSelectedNetwork.name, err)
      }
    }
  
    return cache
  }

// TODO: combine with getFromSelectedNetwork
export async function getInterestedAccountsFromSelectedNetwork<T = any>(apis: Apis, getData: ApiFn<T>, network: RelayChain, offset: number, limit: number, props?: Properties<T>) {
  if (!props) {
    props = {
      cache: {}
    }
  }

  const { cache, needUpdate } = props

  const forceUpdate = (needUpdate && needUpdate())

  const cacheData = cache

  if (isEmptyObj(cacheData) || forceUpdate) {
    try {
      cache['accounts'] = await getData(apis[network])
    } catch (err) {
      log.warn(getFromSelectedNetwork.name, err)
    }
  }

  if(Array.isArray(cache['accounts'])){
    return (cache['accounts']).slice(offset, offset + limit)
  }
  return cache
}

export async function getFromAllNetworks<T = any>(apis: Apis, getData: ApiWithNetworkFn<T>, props?: Properties<T>) {
  if (!props) {
    props = {
      cache: {}
    }
  }

  const { cache, needUpdate } = props

  const forceUpdate = (needUpdate && needUpdate())

  const promises = Object.entries(networks).map(async ([network]) => {
    const cacheData = cache[network]

    if (!cacheData || forceUpdate) {
      cache[network] = await getData(apis[network], network)
    }
  })

  await Promise.all(promises).catch(err => {
    log.warn(getFromAllNetworks.name, err)
  })

  return cache
}

export const fieldsToString = (fields?: Record<string, any>): Record<string, any> | undefined => {
  if (!fields) return undefined

  for (const key in fields) {
    const item = fields[key]
    fields[key] = item?.toString()
  }

  return fields
}

export const asyncErrorHandler = fn =>
  (...args) => {
    const fnReturn = fn(...args)
    const next = args[args.length - 1]
    return Promise.resolve(fnReturn).catch(next)
  }

export const isApiConnected = (api?: ApiPromise) => {
  try {
    const decimals = api.registry.chainDecimals

    return !!decimals && nonEmptyArr(decimals)
  } catch {
    return false
  }
}

export async function runQueryOrUndefined<T extends ApiPromise | SubsocialApi>(
  api: T,
  query: (api: T) => Promise<any>
) {

  if (api instanceof ApiPromise) {
    if (!isApiConnected(api)) return undefined
  } else {
    if (!api) return undefined
  }

  return query(api)
}

export const axiosGetRequest = async (url: string) => {
  try {
    const res = await axios.get(url)
    if (res.status !== 200) {
      log.error(`Failed request to ${url} with status`, res.status)
    }

    return res.data
  } catch (err) {
    log.error(`Failed request to ${url} with error`, err?.stack)
    return undefined
  }
}

let lastUpdate = {
  polkadot: new Date().getTime(),
  kusama: new Date().getTime()
}
const updateDelay = FIVE_MINUTES

const needUpdate = (chain: RelayChain) => {
  const now = new Date().getTime()

  if (now > lastUpdate[chain] + updateDelay) {
    lastUpdate[chain] = now
    return true
  }

  return false
}

export const needUpdateForRelayChain = (relayChain) => needUpdate(relayChain)