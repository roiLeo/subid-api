import { axiosGetRequest } from './utils'
import { FIVE_MINUTES } from '../constant/index'

let pricesCache: any = {}

const cacheKey = 'prices'
const coingeckoUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd'

let lastUpdate = new Date().getTime()
const updateDelay = FIVE_MINUTES //seconds

const needUpdate = () => {
  const now = new Date().getTime()

  if (now > lastUpdate + updateDelay) {
    lastUpdate = now
    return true
  }

  return false
}

const fetchPrices = async (ids: string) => {
  const cacheData = pricesCache[cacheKey] || {}

  if(cacheData?.loading) return

  pricesCache[cacheKey] = {
    ...cacheData,
    loading: true
  }

  const newPrices = await axiosGetRequest(`${coingeckoUrl}&ids=${ids}`)

  pricesCache[cacheKey] = {
    values: newPrices,
    loading: false
  }
}


export const getPrices = async (ids: string) => {
  const forceUpdate = needUpdate && needUpdate()
  const cacheData = pricesCache[cacheKey]
  
  if (!cacheData) {
    await fetchPrices(ids)
  }

  if(forceUpdate) {
    fetchPrices(ids)
  }

  return pricesCache[cacheKey]?.values || []
}