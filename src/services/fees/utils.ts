import { ApiProvider, Bridge, ChainId } from '@subsocial/bridge/build'
import { AcalaAdapter, KaruraAdapter } from '@subsocial/bridge/build/adapters/acala'
import { AstarAdapter, ShidenAdapter } from '@subsocial/bridge/build/adapters/astar'
import { BifrostPolkadotAdapter, BifrostKusamaAdapter } from '@subsocial/bridge/build/adapters/bifrost'
import { AltairAdapter } from '@subsocial/bridge/build/adapters/centrifuge'
import { ShadowAdapter } from '@subsocial/bridge/build/adapters/crust'
import { CrabAdapter } from '@subsocial/bridge/build/adapters/darwinia'
import { BasiliskAdapter, HydraAdapter } from '@subsocial/bridge/build/adapters/hydradx'
import { IntegriteeAdapter } from '@subsocial/bridge/build/adapters/integritee'
import { InterlayAdapter, KintsugiAdapter } from '@subsocial/bridge/build/adapters/interlay'
import { KicoAdapter } from '@subsocial/bridge/build/adapters/kico'
import { PichiuAdapter } from '@subsocial/bridge/build/adapters/kylin'
import { ListenAdapter } from '@subsocial/bridge/build/adapters/listen'
import { CalamariAdapter } from '@subsocial/bridge/build/adapters/manta'
import { MoonbeamAdapter, MoonriverAdapter } from '@subsocial/bridge/build/adapters/moonbeam'
import { TuringAdapter } from '@subsocial/bridge/build/adapters/oak'
import { HeikoAdapter, ParallelAdapter } from '@subsocial/bridge/build/adapters/parallel'
import { KhalaAdapter } from '@subsocial/bridge/build/adapters/phala'
import { PolkadotAdapter, KusamaAdapter } from '@subsocial/bridge/build/adapters/polkadot'
import { StatemineAdapter, StatemintAdapter } from '@subsocial/bridge/build/adapters/statemint'
import { QuartzAdapter } from '@subsocial/bridge/build/adapters/unique'
import { BaseCrossChainAdapter } from '@subsocial/bridge/build/base-chain-adapter'
import { PendulumAdapter } from '@subsocial/bridge/build/adapters/pendulum'
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
