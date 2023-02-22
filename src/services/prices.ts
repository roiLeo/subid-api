import { axiosGetRequest } from './utils'
import { FIVE_MINUTES } from '../constant/index'
import Cache from '../cache'

const cacheKey = 'prices'
const coingeckoUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd'

const pricesCache = new Cache(FIVE_MINUTES)

const fetchPrices = async (ids: string) => {
  const cacheData = pricesCache.get(cacheKey) || {}

  if(cacheData?.loading) return

  pricesCache.set(cacheKey, {
    ...cacheData,
    loading: true
  })

  const newPrices = await axiosGetRequest(`${coingeckoUrl}&ids=${ids}`)

  pricesCache.set(cacheKey, {
    values: newPrices,
    loading: false
  })
}


export const getPrices = async (ids: string) => {
  const needUpdate = pricesCache.needUpdate

  const forceUpdate = needUpdate && needUpdate()
  const cacheData = pricesCache.get(cacheKey)
  
  if (!cacheData) {
    await fetchPrices(ids)
  }

  if(forceUpdate) {
    fetchPrices(ids)
  }

  return pricesCache.get(cacheKey)?.values || []
}