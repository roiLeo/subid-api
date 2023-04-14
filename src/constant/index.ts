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
export const ONFINALITY_API_KEY = '9be88d8b-7470-40b2-8a09-1945b00d5844'

// export const ONFINALITY_API_KEY = '75c71c0d-8fc2-4a6b-b7bb-7ed742293513' // test api key for localhost


export const SUBSOCIAL_GRAPHQL_CLIENT = 'https://squid.subsquid.io/subsocial/graphql'

export const QUARTZ_GRAPHQL_CLIENT = 'https://hasura-quartz.unique.network/v1/graphql'
