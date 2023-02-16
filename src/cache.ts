import { newLogger } from '@subsocial/utils'

const log = newLogger('Cache data')

class Cache <T extends any> {
  private cache: T = {} as any
  private lastUpdate = undefined
  private ttlSeconds: number = undefined

  constructor(ttlSeconds: number) {
    this.lastUpdate = new Date().getTime()
    this.ttlSeconds = ttlSeconds
  }

  needUpdate = () => {
    const now = new Date().getTime()

    if (now > this.lastUpdate + this.ttlSeconds) {
      log.debug('Update properties')
      this.lastUpdate = now
      return true
    }

    return false
  }

  get = (key: string) => {
    return this.cache[key]
  }

  set = <E extends any> (key: string, value: E) => {
    this.cache[key] = value
  }

  getAllValues = () => {
    return this.cache
  }
}


export default Cache
