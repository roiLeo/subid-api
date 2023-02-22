import { SEC } from './env'

export * from './env'

export const FIVE_MINUTES = 5 * 60 * SEC
export const ONE_HOUR = 3600 * SEC

export const TEN_MILLION = 10_000_000


export const validatorsStakingNetworks = [ 
  'polkadot',
  'kusama',
]

export const VALIDATOR_STAKING_REWARDS_API_KEY = 'f00511ab0c5e422796b8f5d9c7029fbe'
export const ONFINALITY_API_KEY = '7f3dc170-944b-4830-9e62-863be28ac644'

export const SUBSOCIAL_GRAPHQL_CLIENT = 'https://squid.subsquid.io/subsocial/graphql'

export const QUARTZ_GRAPHQL_CLIENT = 'https://hasura-quartz.unique.network/v1/graphql'
