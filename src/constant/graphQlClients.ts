import { GraphQLClient } from 'graphql-request'
import { SUBSOCIAL_GRAPHQL_CLIENT, QUARTZ_GRAPHQL_CLIENT } from './index'
import { RelayChain } from '../services/crowdloan/types'

export const subsocialGraphQlClient = new GraphQLClient(SUBSOCIAL_GRAPHQL_CLIENT)

export const contributionsClientByRelay: Record<RelayChain, { client: GraphQLClient; addressPrefix: number }> = {
  kusama: {
    client: new GraphQLClient('https://squid.subsquid.io/kusama-explorer/graphql'),
    addressPrefix: 2
  },
  polkadot: {
    client: new GraphQLClient('https://squid.subsquid.io/polkadot-explorer/graphql'),
    addressPrefix: 0
  }
}

export const quartzClient = new GraphQLClient(QUARTZ_GRAPHQL_CLIENT)