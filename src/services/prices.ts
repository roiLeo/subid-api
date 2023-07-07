import { axiosGetRequest } from './utils'
import { FIVE_MINUTES } from '../constant/index'
import Cache from '../cache'

const cacheKey = 'prices'
const coingeckoUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd'

const pricesCache = new Cache<any>('prices', FIVE_MINUTES)

const fetchPrices = async (ids: string) => {
  const cacheData = await pricesCache.get(cacheKey) || ({} as any)

  if (cacheData?.loading) return

  await pricesCache.set(cacheKey, {
    ...cacheData,
    loading: true
  })

  const newPrices = await axiosGetRequest(`${coingeckoUrl}&ids=${ids}`)

  await pricesCache.set(cacheKey, {
    values: newPrices,
    loading: false
  })
}

export const getPrices = async (ids: string) => {
  const needUpdate = pricesCache.needUpdate

  const forceUpdate = needUpdate && (await needUpdate())
  const cacheData = await pricesCache.get(cacheKey)

  if (!cacheData) {
    await fetchPrices(ids)
  }

  if (forceUpdate) {
    fetchPrices(ids)
  }

  const cachedData = await pricesCache.get(cacheKey)

  return cachedData?.values || []
}
