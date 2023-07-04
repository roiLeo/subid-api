import { ApiProvider, Bridge, ChainName } from '@polkawallet/bridge'
import { AcalaAdapter, KaruraAdapter } from '@polkawallet/bridge/adapters/acala'
import { AstarAdapter, ShidenAdapter } from '@polkawallet/bridge/adapters/astar'
import { BifrostAdapter } from '@polkawallet/bridge/adapters/bifrost'
import { AltairAdapter } from '@polkawallet/bridge/adapters/centrifuge'
import { ShadowAdapter } from '@polkawallet/bridge/adapters/crust'
import { CrabAdapter } from '@polkawallet/bridge/adapters/darwinia'
import { BasiliskAdapter } from '@polkawallet/bridge/adapters/hydradx'
import { IntegriteeAdapter } from '@polkawallet/bridge/adapters/integritee'
import { InterlayAdapter, KintsugiAdapter } from '@polkawallet/bridge/adapters/interlay'
import { KicoAdapter } from '@polkawallet/bridge/adapters/kico'
import { PichiuAdapter } from '@polkawallet/bridge/adapters/kylin'
import { CalamariAdapter } from '@polkawallet/bridge/adapters/manta'
import { MoonbeamAdapter, MoonriverAdapter } from '@polkawallet/bridge/adapters/moonbeam'
import { TuringAdapter } from '@polkawallet/bridge/adapters/oak'
import { HeikoAdapter, ParallelAdapter } from '@polkawallet/bridge/adapters/parallel'
import { KhalaAdapter } from '@polkawallet/bridge/adapters/phala'
import { PolkadotAdapter, KusamaAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { StatemineAdapter } from '@polkawallet/bridge/adapters/statemint'
import { QuartzAdapter } from '@polkawallet/bridge/adapters/unique'
import { BaseCrossChainAdapter } from '@polkawallet/bridge/base-chain-adapter'
import { firstValueFrom } from 'rxjs'

const transferAdapters: Record<string, { adapter: BaseCrossChainAdapter; chainName?: ChainName }> = {
  polkadot: {
    adapter: new PolkadotAdapter(),
  },
  kusama: {
    adapter: new KusamaAdapter(),
  },
  karura: {
    adapter: new KaruraAdapter(),
  },
  bifrost: {
    adapter: new BifrostAdapter(),
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
    adapter: new StatemineAdapter(),
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
  integritee: {
    adapter: new IntegriteeAdapter(),
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
  calamari: {
    adapter: new CalamariAdapter(),
  },
  moonbeam: {
    adapter: new MoonbeamAdapter(),
  },
  moonriver: {
    adapter: new MoonriverAdapter(),
  },
  turing: {
    adapter: new TuringAdapter(),
  },
  parallel: {
    adapter: new ParallelAdapter(),
  },
  parallelHeiko: {
    adapter: new HeikoAdapter(),
    chainName: 'heiko'
  },
  khala: {
    adapter: new KhalaAdapter(),
  },
  quartz: {
    adapter: new QuartzAdapter(),
  },
}
function getPolkawalletChainName (chain: string) {
  const chainData = transferAdapters[chain]
  if (!chainData) return undefined
  return chainData.chainName || chain as ChainName
}

const provider = new ApiProvider()

const bridge = new Bridge({ adapters: Object.values(transferAdapters).map(({ adapter }) => adapter) })

export async function getCrossChainAdapter (chain: string, connectNode?: string): Promise<BaseCrossChainAdapter | undefined> {
  const chainName = getPolkawalletChainName(chain)
  if (!chainName) return undefined

  const adapter = bridge.findAdapter(chainName)
  if (connectNode) {
    await firstValueFrom(provider.connectFromChain([ chainName ], { [chainName]: [ connectNode ] }))
    await adapter.setApi(provider.getApi(chainName))
  }
  return adapter
}
