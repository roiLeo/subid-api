import { ApiProvider, Bridge, ChainId } from '@subsocial/subid-bridge'
import { AcalaAdapter, KaruraAdapter } from '@subsocial/subid-bridge/adapters/acala'
import { AstarAdapter, ShidenAdapter } from '@subsocial/subid-bridge/adapters/astar'
import { BifrostPolkadotAdapter, BifrostKusamaAdapter } from '@subsocial/subid-bridge/adapters/bifrost'
import { AltairAdapter } from '@subsocial/subid-bridge/adapters/centrifuge'
import { ShadowAdapter } from '@subsocial/subid-bridge/adapters/crust'
import { CrabAdapter } from '@subsocial/subid-bridge/adapters/darwinia'
import { BasiliskAdapter, HydraAdapter } from '@subsocial/subid-bridge/adapters/hydradx'
import { IntegriteeAdapter } from '@subsocial/subid-bridge/adapters/integritee'
import { InterlayAdapter, KintsugiAdapter } from '@subsocial/subid-bridge/adapters/interlay'
import { KicoAdapter } from '@subsocial/subid-bridge/adapters/kico'
import { PichiuAdapter } from '@subsocial/subid-bridge/adapters/kylin'
import { ListenAdapter } from '@subsocial/subid-bridge/adapters/listen'
import { CalamariAdapter } from '@subsocial/subid-bridge/adapters/manta'
import { MoonbeamAdapter, MoonriverAdapter } from '@subsocial/subid-bridge/adapters/moonbeam'
import { TuringAdapter } from '@subsocial/subid-bridge/adapters/oak'
import { HeikoAdapter, ParallelAdapter } from '@subsocial/subid-bridge/adapters/parallel'
import { KhalaAdapter } from '@subsocial/subid-bridge/adapters/phala'
import { PolkadotAdapter, KusamaAdapter } from '@subsocial/subid-bridge/adapters/polkadot'
import { StatemineAdapter, StatemintAdapter } from '@subsocial/subid-bridge/adapters/statemint'
import { QuartzAdapter } from '@subsocial/subid-bridge/adapters/unique'
import { BaseCrossChainAdapter } from '@subsocial/subid-bridge/base-chain-adapter'
import { PendulumAdapter } from '@subsocial/subid-bridge/adapters/pendulum'
import { firstValueFrom } from 'rxjs'

const transferAdapters: Record<string, { adapter: BaseCrossChainAdapter; chainName?: ChainId }> = {
  polkadot: {
    adapter: new PolkadotAdapter(),
  },
  kusama: {
    adapter: new KusamaAdapter(),
  },
  karura: {
    adapter: new KaruraAdapter(),
  },
  astar: {
    adapter: new AstarAdapter(),
  },
  shiden: {
    adapter: new ShidenAdapter(),
  },
  acala: {
    adapter: new AcalaAdapter(),
  },
  statemine: {
    adapter: new StatemineAdapter(),
  },
  statemint: {
    adapter: new StatemintAdapter(),
  },
  altair: {
    adapter: new AltairAdapter(),
  },
  shadow: {
    adapter: new ShadowAdapter(),
  },
  'darwinia-crab-parachain': {
    adapter: new CrabAdapter(),
    chainName: 'crab'
  },
  basilisk: {
    adapter: new BasiliskAdapter(),
  },
  kintsugi: {
    adapter: new KintsugiAdapter(),
  },
  interlay: {
    adapter: new InterlayAdapter(),
  },
  kico: {
    adapter: new KicoAdapter(),
  },
  pichiu: {
    adapter: new PichiuAdapter(),
  },
  listen: {
    adapter: new ListenAdapter(),
  },
  calamari: {
    adapter: new CalamariAdapter(),
  },
  moonbeam: {
    adapter: new MoonbeamAdapter(),
  },
  moonriver: {
    adapter: new MoonriverAdapter(),
  },
  khala: {
    adapter: new KhalaAdapter(),
  },
  quartz: {
    adapter: new QuartzAdapter(),
  },
  // TODO: uncomment when new polkawallet version is up and supports networks below
  bifrostKusama: {
    adapter: new BifrostKusamaAdapter(),
  },
  bifrostPolkadot: {
    adapter: new BifrostPolkadotAdapter(),
  },
  integritee: {
    adapter: new IntegriteeAdapter(),
  },
  turing: {
    adapter: new TuringAdapter(),
  },
  parallel: {
    adapter: new ParallelAdapter(),
  },
  heiko: {
    adapter: new HeikoAdapter(),
    chainName: 'heiko'
  },
  hydra: {
    adapter: new HydraAdapter()
  },
  pendulum: {
    adapter: new PendulumAdapter()
  }
}
function getPolkawalletChainName (chain: string) {
  const chainData = transferAdapters[chain]
  if (!chainData) return undefined
  return chainData.chainName || chain as ChainId
}

const provider = new ApiProvider()

const bridge = new Bridge({ adapters: Object.values(transferAdapters).map(({ adapter }) => adapter) })

export async function getCrossChainAdapter (chain: string, connectNode?: string): Promise<BaseCrossChainAdapter | undefined> {
  const chainName = getPolkawalletChainName(chain)
  if (!chainName) return undefined

  const adapter = bridge.findAdapter(chainName)
  if (connectNode) {
    await firstValueFrom(provider.connectFromChain([ chainName ], { [chainName]: [ connectNode ] }) as any)
    await adapter.init(provider.getApi(chainName))
  }
  return adapter
}
