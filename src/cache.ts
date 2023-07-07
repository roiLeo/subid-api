import { newLogger } from '@subsocial/utils'
import { redisCallWrapper } from './redisCache'

const log = newLogger('Cache data')

export const getRedisKey = (prefix: string, key: string) => `${prefix}:${key}`

const getLastUpdate = (prefix: string) => `${prefix}:last-update-time`

class Cache<T extends any> {
  private ttlSeconds: number = undefined
  private prefix: string = ''

  constructor(prefix: string, ttlSeconds: number) {
    redisCallWrapper((redis) => redis?.set(getLastUpdate(prefix), new Date().getTime()))
    this.ttlSeconds = ttlSeconds
    this.prefix = prefix
  }

  needUpdate = async () => {
    const now = new Date().getTime()

    const lastUpdate = await redisCallWrapper((redis) => redis?.get(getLastUpdate(this.prefix)))

    if (now > parseInt(lastUpdate || '0') + this.ttlSeconds) {
      log.debug('Update properties')
      await redisCallWrapper((redis) => redis?.set(getLastUpdate(this.prefix), now))
      return true
    }

    return false
  }

  get = async (key: string) => {
    const result = await redisCallWrapper(async (redis) =>
      redis?.get(getRedisKey(this.prefix, key))
    )

    return result ? (JSON.parse(result) as T) : undefined
  }

  set = async <E extends any>(key: string, value: E) => {
    await redisCallWrapper((redis) => redis?.set(getRedisKey(this.prefix, key), JSON.stringify(value)))
  }

  getAllValues = (keys: string[]) => {
    return redisCallWrapper<Record<string, T>>(async (redis) => {
      const resultPromise = keys.map(async (key) => {
        const data = await redis.get(getRedisKey(this.prefix, key))
        return JSON.parse(data)
      })

      const result = await Promise.all(resultPromise)

      const data = {}

      keys.forEach((key, i) => {
        data[key] = result[i]
      })

      return data
    })
  }
}

export default Cache
