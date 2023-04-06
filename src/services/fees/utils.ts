import { ApiProvider, Bridge, ChainId } from '@subid/bridge/build'
import { AcalaAdapter, KaruraAdapter } from '@subid/bridge/build/adapters/acala'
import { AstarAdapter, ShidenAdapter } from '@subid/bridge/build/adapters/astar'
import { BifrostPolkadotAdapter, BifrostKusamaAdapter } from '@subid/bridge/build/adapters/bifrost'
import { AltairAdapter } from '@subid/bridge/build/adapters/centrifuge'
import { ShadowAdapter } from '@subid/bridge/build/adapters/crust'
import { CrabAdapter } from '@subid/bridge/build/adapters/darwinia'
import { BasiliskAdapter, HydraAdapter } from '@subid/bridge/build/adapters/hydradx'
import { IntegriteeAdapter } from '@subid/bridge/build/adapters/integritee'
import { InterlayAdapter, KintsugiAdapter } from '@subid/bridge/build/adapters/interlay'
import { KicoAdapter } from '@subid/bridge/build/adapters/kico'
import { PichiuAdapter } from '@subid/bridge/build/adapters/kylin'
import { ListenAdapter } from '@subid/bridge/build/adapters/listen'
import { CalamariAdapter } from '@subid/bridge/build/adapters/manta'
import { MoonbeamAdapter, MoonriverAdapter } from '@subid/bridge/build/adapters/moonbeam'
import { TuringAdapter } from '@subid/bridge/build/adapters/oak'
import { HeikoAdapter, ParallelAdapter } from '@subid/bridge/build/adapters/parallel'
import { KhalaAdapter } from '@subid/bridge/build/adapters/phala'
import { PolkadotAdapter, KusamaAdapter } from '@subid/bridge/build/adapters/polkadot'
import { StatemineAdapter, StatemintAdapter } from '@subid/bridge/build/adapters/statemint'
import { QuartzAdapter } from '@subid/bridge/build/adapters/unique'
import { BaseCrossChainAdapter } from '@subid/bridge/build/base-chain-adapter'
import { PendulumAdapter } from '@subid/bridge/build/adapters/pendulum'
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
