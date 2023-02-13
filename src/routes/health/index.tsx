import { Handler, Router } from 'express'
import { Apis } from '../../connections/networks/types'
import { getNetworksProperties } from '../../services/properties'

const STATUS_READY = '/readiness'
const STATUS_LIVE = '/liveness'

type Status = 'UP' | 'DOWN'

type CheckResponse = {
  status: Status
  [key: string]: any
}

type CheckFn = (...args: any[]) => Promise<CheckResponse>

const getStatus = (isUp: boolean) => (isUp ? 'UP' : 'DOWN')
const buildCheckResponse = (isUp: boolean, details?: Record<string, any>): CheckResponse => ({
  status: getStatus(isUp),
  details
})

type HasConnected = {
  connected: boolean
}

const checkMainChains: CheckFn = async (apis: Apis) => {
  const { subsocial } = await getNetworksProperties({ apis })

  const mainChains = [ subsocial ] as unknown as HasConnected[]
  const connected = mainChains.some(x => x.connected)

  return buildCheckResponse(connected, { subsocial })
}

const buildCheckFunctions = async (apis: Apis) => {
  const responses = await Promise.all([
    checkMainChains(apis),
  ])

  const isHealth = responses.every((res) => res.status === 'UP')

  const [ mainChains ] = responses

  return buildCheckResponse(isHealth, { mainChains })
}

const checkHealth = async (checkFn: CheckFn) => {
  const responses = await Promise.all([ checkFn(), checkFn() ])

  const isHealth = responses.every((res) => res.status === 'UP')

  const [ readiness, liveness ] = responses

  return buildCheckResponse(isHealth, { readiness, liveness })
}

const buildCheckHeader =
  (check: CheckFn): Handler =>
  async (_, res) => {
    const response = await check()

    if (response.status === 'UP') {
      res.json(response)
    } else {
      res.status(500).json(response)
    }
  }

export const createHealthRoutes = (apis: Apis) => {
  const router = Router()
  const checkFn = () => buildCheckFunctions(apis)

  router.get('/', buildCheckHeader(() => checkHealth(checkFn)))
  router.get(STATUS_READY, buildCheckHeader(checkFn))
  router.get(STATUS_LIVE, buildCheckHeader(checkFn))

  return router
}

export default createHealthRoutes
