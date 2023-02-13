import { polkadotParachains, kusamaParachains } from '../../connections/networks'
import { Network } from '../../connections/networks/types'

export type RelayChain = 'polkadot' | 'kusama'

export const parachainsTupleByRelayChain: Record<RelayChain, [string, Network][]> = {
  polkadot: Object.entries(polkadotParachains),
  kusama: Object.entries(kusamaParachains)
}

export const relayChains: RelayChain[] = [ 'polkadot', 'kusama' ]