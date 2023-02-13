import networks, { subsocial as connection } from './networks'
import { Apis, GetApiFn } from './networks/types'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { newLogger } from '@subsocial/utils'
import rpc from '@polkadot/types/interfaces/jsonrpc'
import { typesChain, typesBundle } from '@polkadot/apps-config/api'
import { SubsocialApi } from '@subsocial/api'
import { wsReconnectTimeout } from '../constant'
import { updatePropertiesByNetwork } from '../services/properties'
import { getValidatorsData } from '../services/validatorStaking/validatorsInfo';
import { validatorsStakingNetworks } from '../constant/index';
import { SEC } from '../constant/env';

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
  types: any
  connections: Apis
  getApi: GetApiFn
}

const defaultGetApi: GetApiFn = ({ provider, types }) => new ApiPromise({ provider, types, rpc, typesBundle: typesBundle as any, typesChain })

const connect = async ({ node, getApi, types, network, connections }: Props) => {
  if (!node) return

  const nodeName = `${network} node at ${node}`

  log.info(`Connecting to ${nodeName}...`)

  const provider = new WsProvider(node, wsReconnectTimeout, {}, 100 * SEC)
  const api = getApi({ provider, types })

  
  try {
    connections[network] = await api.isReadyOrError
    await updatePropertiesByNetwork(api, network)
    
    if(validatorsStakingNetworks.includes(network)) {
      await getValidatorsData(api, network)
    }
  } catch {
    console.error(`Problem with connection to ${nodeName}`)
  }
}

export const createConnections = async () => {
  const connections: Apis = {} as Apis

  // For fast connection on localhost
  if (process.env.NODE_ENV === 'dev') {
    const promises = Object.entries(networks).map(async ([ network, { node, types, getApi = defaultGetApi, disabled } ]) => {
      if (node) {
        try {
          !disabled && await connect({ network, node, types, connections, getApi })
        } catch (err) {
          log.error('Unexpected error:', err)
        }
      }
    })
  
    await Promise.all(promises)
  } else {
    for (const value of Object.entries(networks)) {
      const [ network, { node, types, getApi = defaultGetApi, disabled } ] = value
  
      if (node) {
        try {
          !disabled && await connect({ network, node, types, connections, getApi })
        } catch (err) {
          log.error('Unexpected error:', err)
        }
      }
    }
  }

  subsocial = resolveSubsocialApi(connections.subsocial)

  return connections
}
