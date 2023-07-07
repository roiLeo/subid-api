import Redis, { RedisOptions } from 'ioredis'
import { newLogger } from '@subsocial/utils';

const log = newLogger('Redis')

let redis: Redis | undefined = undefined

export function checkEnv(data: string | undefined, envName: string, throwError = false) {
  if (data === undefined && throwError) {
    throw new Error(`env ${envName} is not set`)
  }
  return data as string
}

export function getRedisConfig() {
  const host = checkEnv(process.env.REDIS_HOST, 'REDIS_HOST')
  const port = checkEnv(process.env.REDIS_PORT, 'REDIS_PORT')
  const password = checkEnv(process.env.REDIS_PASSWORD, 'REDIS_PASSWORD')

  const parsedPort = parseInt(port)

  if (!host || !port || isNaN(parsedPort) || !password) {
    log.error('Redis configuration is not complete, need host, port, password')
    throw new Error('Redis configuration is not complete, need host, port, password')
  }

  return { host, port: parsedPort, password }
}

export function createRedisInstance() {
  try {
    const config = getRedisConfig()
    
    const options: RedisOptions = {
      host: config.host,
      password: config.password,
      port: config.port,

      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      commandTimeout: 250,
      retryStrategy: (times: number) => {
        return Math.min(times * 200, 1000)
      }
    }

    const redis = new Redis(options)

    redis.on('error', (error: any) => {
      log.warn('[Redis] Warning: error connecting to redis', error?.message)
    })

    return redis
  } catch (e) {
    console.error(`[Redis] Could not create a Redis instance`)
    return null
  }
}

export async function redisCallWrapper<T = void>(
  callback: (redis: Redis | null) => Promise<T> | undefined
) {
  try {
    if(!redis) {
      redis = createRedisInstance()
    }
    return await callback(redis)
  } catch (err: any) {
    log.warn('[Redis] Warning: operation failed', err?.message)
    return null
  }
}
