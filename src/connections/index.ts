import networks, { subsocial as connection } from './networks'
import { Apis, GetApiFn } from './networks/types'
import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'
import { newLogger } from '@subsocial/utils'
import rpc from '@polkadot/types/interfaces/jsonrpc'
import { typesChain, typesBundle } from '@polkadot/apps-config/api'
import { SubsocialApi } from '@subsocial/api'
import { wsReconnectTimeout } from '../constant'
import { updatePropertiesByNetwork } from '../services/properties'
import { getValidatorsData } from '../services/validatorStaking/validatorsInfo'
import { validatorsStakingNetworks } from '../constant/index'
import { SEC } from '../constant/env'

const log = newLogger('Connections')

const { node, ipfs, offchain } = connection

const subsocialApiProps = {
  substrateNodeUrl: node,
  ipfsNodeUrl: ipfs,
  offchainUrl: offchain
}

let subsocial: SubsocialApi

export const resolveSubsocialApi = (substrateApi?: ApiPromise) => {
  if (!subsocial) {
    if (!substrateApi) return undefined

    subsocial = new SubsocialApi({ substrateApi, ...subsocialApiProps })
  }

  return subsocial
}

type Props = {
  node: string
  network: string
  isMixedConnection?: boolean
  types: any
  mixedApis: Apis
  wsApis: Apis
  wsNode: string
  getApi: GetApiFn
}

const defaultGetApi: GetApiFn = ({ provider, types }) =>
  new ApiPromise({ provider, types, rpc, typesBundle: typesBundle as any, typesChain })

const connect = async ({
  node,
  wsNode,
  getApi,
  types,
  network,
  isMixedConnection,
  mixedApis,
  wsApis
}: Props) => {
  if (!node) return

  const nodeName = `${network} node at ${node}`

  log.info(`Connecting to ${nodeName}...`)

  const isHttps = node.includes('https')

  let wsApi = undefined

  const provider = isHttps
    ? new HttpProvider(node, {})
    : new WsProvider(node, wsReconnectTimeout, {}, 100 * SEC)

  if (isHttps && isMixedConnection) {
    const wsProvider = new WsProvider(wsNode, wsReconnectTimeout, {}, 100 * SEC)

    wsApi = getApi({ provider: wsProvider, types })
  }

  const api = getApi({ provider, types })

  try {
    const apiReady = await api.isReadyOrError
    const wsApiReady = await wsApi?.isReadyOrError

    mixedApis[network] = apiReady
    wsApis[network] = wsApiReady

    await updatePropertiesByNetwork(api, network)

    if (validatorsStakingNetworks.includes(network)) {
      await getValidatorsData(wsApi || api, network)
    }
  } catch {
    console.error(`Problem with connection to ${nodeName}`)
  }
}

export type Connections = {
  mixedApis: Apis
  wsApis: Apis
}

export const createConnections = async () => {
  let connections: Connections = {} as Connections
  const mixedApis: Apis = {} as Apis
  const wsApis: Apis = {} as Apis

  // For fast connection on localhost
  if (process.env.NODE_ENV === 'dev') {
    const promises = Object.entries(networks).map(
      async ([
        network,
        { node, types, getApi = defaultGetApi, disabled, isMixedConnection, wsNode }
      ]) => {
        if (node) {
          try {
            !disabled &&
              (await connect({
                network,
                node,
                wsNode,
                types,
                isMixedConnection,
                mixedApis,
                wsApis,
                getApi
              }))
          } catch (err) {
            log.error('Unexpected error:', err)
          }
        }
      }
    )

    await Promise.all(promises)
  } else {
    for (const value of Object.entries(networks)) {
      const [
        network,
        { node, types, getApi = defaultGetApi, isMixedConnection, wsNode, disabled }
      ] = value

      if (node) {
        try {
          !disabled &&
            (await connect({
              network,
              node,
              types,
              wsNode,
              mixedApis,
              wsApis,
              isMixedConnection,
              getApi
            }))
        } catch (err) {
          log.error('Unexpected error:', err)
        }
      }
    }
  }

  connections = {
    mixedApis,
    wsApis
  }

  subsocial = resolveSubsocialApi(connections.mixedApis.subsocial)

  return connections
}
