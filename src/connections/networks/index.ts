import { Networks } from './types'
import { getBitfrostApi, resolveOnfinalityUrl } from './utils'
import { RelayChain } from '../../services/crowdloan/types'

export const subsocial = {
  name: 'Subsocial',
  node: 'wss://para.subsocial.network',
  icon: 'subsocial-parachain.svg',
  paraId: 2100,
  ipfs: 'https://ipfs.subsocial.network',
  offchain: 'https://api.subsocial.network'
}

export const standalones: Networks = {
  kusama: {
    name: 'Kusama',
    node: resolveOnfinalityUrl('kusama'),
    icon: 'kusama.svg',
    isTransferable: true
  },
  polkadot: {
    name: 'Polkadot',
    node: resolveOnfinalityUrl('polkadot'),
    icon: 'polkadot.svg',
    isTransferable: true
  },
  rococo: {
    name: 'Rococo',
    node: 'wss://rococo-rpc.polkadot.io',
    icon: ''
  },
  sora: {
    name: 'SORA',
    icon: 'sora-substrate.svg',
    node: resolveOnfinalityUrl('sora'),
    nativeToken: 'XOR',
    isTransferable: true
  },
  edgeware: {
    name: 'Edgeware',
    icon: 'edgeware-circle.svg',
    node: resolveOnfinalityUrl('edgeware'),
  },
  chainx: {
    name: 'ChainX',
    icon: 'chainx.svg',
    node: 'wss://mainnet.chainx.org',
    isTransferable: true
  },
  darwinia: {
    name: 'Darwinia',
    icon: 'darwinia.png',
    node: 'wss://rpc.darwinia.network',
    isTransferable: true
  },
  'darwinia-crab': {
    name: 'Darwinia Crab',
    icon: 'crab.svg',
    node: 'wss://crab-rpc.darwinia.network',
    isTransferable: true
  },
  polkadex: {
    name: 'Polkadex',
    icon: 'polkadex.svg',
    node: resolveOnfinalityUrl('polkadex'),
  },
  crust: {
    name: 'Crust',
    icon: 'crust.svg',
    node: resolveOnfinalityUrl('crust'),
  }
}

export const kusamaParachains: Networks = {
  subsocial: {
    ...subsocial,
    vestingMethod: 'vesting.vest'
  },
  calamari: {
    name: 'Calamari',
    node: 'wss://ws.calamari.systems/',
    icon: 'calamari.png',
    paraId: 2084,
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  altair: {
    name: 'Altair',
    node: resolveOnfinalityUrl('altair'),
    icon: 'altair.svg',
    paraId: 2088,
    vestingMethod: 'vesting.vest',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  basilisk: {
    name: 'Basilisk',
    node: 'wss://rpc.basilisk.cloud',
    icon: 'basilisk.jpg',
    paraId: 2090,
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  parallelHeiko: {
    name: 'Parallel Heiko',
    node: 'wss://heiko-rpc.parallel.fi',
    icon: 'parallel.svg',
    nativeToken: 'HKO',
    paraId: 2085,
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  kilt: {
    name: 'Kilt Spiritnet',
    node: resolveOnfinalityUrl('spiritnet'),
    icon: 'kilt.png',
    paraId: 2086,
    isTransferable: true
  },
  polkasmith: {
    name: 'PolkaSmith',
    node: '',
    icon: 'polkasmith.svg',
    paraId: 2009,
    disabled: true
  },
  bifrost: {
    name: 'Bifrost',
    node: resolveOnfinalityUrl('bifrost-parachain'),
    icon: 'bifrost.svg',
    paraId: 2001,
    getApi: getBitfrostApi,
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  statemine: {
    name: 'Statemine',
    node: resolveOnfinalityUrl('statemine'),
    icon: 'statemine.svg',
    paraId: 1000,
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  genshiro: {
    name: 'Genshiro',
    icon: 'genshiro.svg',
    node: 'wss://node.genshiro.io',
    paraId: 2024,
    nativeToken: 'GENS'
  },
  integritee: {
    name: 'Integritee Network',
    icon: 'integritee.svg',
    node: 'wss://kusama.api.integritee.network',
    paraId: 2015,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  karura: {
    name: 'Karura',
    node: resolveOnfinalityUrl('karura'),
    icon: 'karura.svg',
    paraId: 2000,
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  khala: {
    name: 'Khala',
    icon: 'khala.svg',
    node: resolveOnfinalityUrl('khala'),
    paraId: 2004,
    types: {
      BridgeChainId: 'u8'
    },
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  kintsugi: {
    name: 'Kintsugi BTC',
    icon: 'kintsugi.png',
    node: resolveOnfinalityUrl('kintsugi'),
    paraId: 2092,
    nativeToken: 'KINT',
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  mars: {
    name: 'Mars',
    icon: 'mars.png',
    node: '',
    paraId: 2008,
    disabled: true
  },
  moonriver: {
    name: 'Moonriver',
    node: resolveOnfinalityUrl('moonriver'),
    icon: 'moonriver.svg',
    paraId: 2023,
    isEthLike: true,
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  sakura: {
    name: 'Sakura',
    icon: 'sakura.svg',
    node: '',
    paraId: 2016,
    disabled: true
  },
  sherpax: {
    name: 'SherpaX',
    icon: 'sherpax.svg',
    node: '',
    paraId: 2013,
    disabled: true
  },
  shiden: {
    name: 'Shiden',
    node: resolveOnfinalityUrl('shiden'),
    icon: 'shiden.png',
    paraId: 2007,
    vestingMethod: 'vesting.vest',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  picasso: {
    name: 'Picasso',
    node: 'wss://rpc.composablenodes.tech',
    icon: 'picasso.png',
    paraId: 2087,
    nativeToken: 'PICA',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  shadow: {
    name: 'Crust Shadow',
    node: 'wss://rpc-shadow.crust.network',
    icon: 'shadow.svg',
    nativeToken: 'CSM',
    paraId: 2012,
    disabled: true
  },
  bitCountry: {
    name: 'Bit.Country Pioneer',
    node: resolveOnfinalityUrl('pioneer'),
    icon: 'bitcountry.svg',
    paraId: 2096,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  robonomics: {
    name: 'Robonomics',
    node: resolveOnfinalityUrl('robonomics'),
    icon: 'robonomics.svg',
    paraId: 2048,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  quartz: {
    name: 'QUARTZ by UNIQUE',
    node: resolveOnfinalityUrl('quartz'),
    icon: 'quartz.png',
    paraId: 2095,
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  zeitgeist: {
    name: 'Zeitgeist',
    node: resolveOnfinalityUrl('zeitgeist'),
    icon: 'zeitgeist.png',
    paraId: 2101,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  mangata: {
    name: 'Mangata X',
    icon: 'mangata.png',
    node: resolveOnfinalityUrl('mangatax'),
    disabled: true,
    nativeToken: 'MGX',
    paraId: 2110,
    isTransferable: true
  },
  litmus: {
    name: 'Litmus',
    icon: 'litmus.png',
    node: 'wss://rpc.litmus-parachain.litentry.io',
    paraId: 2106,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  kico: {
    name: 'KICO',
    icon: 'kico.png',
    node: 'wss://rpc.kico.dico.io',
    disabled: true,
    nativeToken: 'KICO',
    paraId: 2107,
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  'darwinia-crab-parachain': {
    name: 'Darwinia Crab Parachain',
    icon: 'crab.svg',
    node: resolveOnfinalityUrl('darwinia-crab'),
    disabled: true,
    nativeToken: 'CRAB',
    paraId: 2105,
    isTransferable: true
  },
  'sora-parachain': {
    name: 'SORA Kusama Parachain',
    icon: 'sora-substrate.svg',
    node: 'wss://ws.parachain-collator-1.c1.sora2.soramitsu.co.jp',
    disabled: true,
    paraId: 2011
  },
  'pichiu': {
    name: 'Pichiu',
    icon: 'pichiu.png',
    node: resolveOnfinalityUrl('pichiu-oracle'),
    disabled: true,
    nativeToken: 'PCHU',
    paraId: 2102,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  turing: {
    name: 'Turing Network',
    node: 'wss://rpc.turing.oak.tech',
    paraId: 2114,
    icon: 'turing.png',
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  dora: {
    name: 'Dora Factory',
    node: 'wss://kusama.dorafactory.org',
    disabled: true,
    nativeToken: 'DORA',
    paraId: 2115,
    icon: 'dora.png'
  },
  tanganika: {
    name: 'Tanganika',
    node: 'wss://tanganika.datahighway.com',
    paraId: 2116,
    nativeToken: 'DHX',
    icon: 'tanganika.png',
    disabled: true
  },
  listen: {
    name: 'Listen Network',
    node: 'wss://rpc.mainnet.listen.io',
    nativeToken: 'LT',
    paraId: 2118,
    icon: 'listen.png',
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  invArch: {
    name: 'InvArch Tinkernet',
    node: resolveOnfinalityUrl('invarch-tinkernet'),
    nativeToken: 'TNKR',
    paraId: 2125,
    icon: 'invArch.png',
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  kabocha: {
    name: 'Kabocha',
    node: 'wss://kabocha.jelliedowl.net',
    disabled: true,
    nativeToken: 'KAB',
    paraId: 2113,
    icon: 'kabocha.svg'
  },
  bajun: {
    name: 'Bajun Network',
    node: resolveOnfinalityUrl('bajun'),
    disabled: true,
    nativeToken: 'BAJU',
    paraId: 2119,
    icon: 'bajun.png',
    vestingMethod: 'vesting.claim'
  },
  imbue: {
    name: 'Imbue Network',
    node: 'wss://imbue-kusama.imbue.network',
    disabled: true,
    nativeToken: 'IMBU',
    paraId: 2121,
    icon: 'imbue.jpg',
    vestingMethod: 'vesting.vest'
  },
  gm: {
    name: 'GM',
    node: 'wss://ws.gm.bldnodes.org',
    disabled: true,
    nativeToken: 'FREN',
    paraId: 2123,
    icon: 'gm.jpg',
    vestingMethod: 'carrotOnAStick.claim',
    isTransferable: true
  },
  amplitude: {
    name: 'Amplitude',
    node: 'wss://rpc-amplitude.pendulumchain.tech',
    disabled: true,
    nativeToken: 'AMPE',
    paraId: 2124,
    icon: 'amplitude.jpg',
    vestingMethod: 'vesting.vest'
  }
}

export const polkadotParachains: Networks = {
  moonbeam: {
    name: 'Moonbeam',
    node: resolveOnfinalityUrl('moonbeam'),
    icon: 'moonbeam.png',
    paraId: 2004,
    isEthLike: true,
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  clover: {
    name: 'Clover Finance',
    node: resolveOnfinalityUrl('clover'),
    disabled: true,
    nativeToken: 'CLV',
    icon: 'clover.svg',
    paraId: 2002,
    vestingMethod: 'vesting.vest'
  },
  astar: {
    name: 'Astar',
    node: resolveOnfinalityUrl('astar'),
    icon: 'astar.png',
    paraId: 2006,
    vestingMethod: 'vesting.vest',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  litentry: {
    name: 'Litentry',
    node: resolveOnfinalityUrl('litentry'),
    disabled: true,
    nativeToken: 'LIT',
    icon: 'litentry.png',
    paraId: 2013,
    vestingMethod: 'vesting.vest'
  },
  manta: {
    name: 'Manta',
    node: '',
    icon: 'manta.png',
    paraId: 2015
  },
  subdao: {
    name: 'SubDAO',
    node: '',
    icon: 'subdao.png',
    paraId: 2018
  },
  'parallel': {
    name: 'Parallel',
    node: resolveOnfinalityUrl('parallel'),
    icon: 'parallel.svg',
    paraId: 2012,
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  acala: {
    name: 'Acala',
    node: resolveOnfinalityUrl('acala-polkadot'),
    icon: 'acala.svg',
    paraId: 2000,
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  'darwinia-pokadot': {
    name: 'Darwinia',
    node: '',
    icon: 'darwinia.png',
    paraId: 2003
  },
  subGame: {
    name: 'SubGame Gamma',
    node: '',
    icon: 'subgame.svg',
    paraId: 2017
  },
  efinity: {
    name: 'Efinity',
    node: resolveOnfinalityUrl('efinity'),
    nativeToken: 'EFI',
    disabled: true,
    icon: 'efinity.svg',
    paraId: 2021,
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  composable: {
    name: 'Composable Finance',
    node: resolveOnfinalityUrl('composable'),
    disabled: true,
    nativeToken: 'LAYR',
    icon: 'composableFinance.png',
    paraId: 2019
  },
  interlay: {
    name: 'Interlay',
    node: resolveOnfinalityUrl('interlay'),
    icon: 'interlay.svg',
    paraId: 2032,
    nativeToken: 'INTR',
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  centrifuge: {
    name: 'Centrifuge',
    icon: 'centrifuge.png',
    node: resolveOnfinalityUrl('centrifuge-parachain'),
    paraId: 2031,
    vestingMethod: 'vesting.vest',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  phala: {
    name: 'Phala Network',
    icon: 'phala.svg',
    node: resolveOnfinalityUrl('phala'),
    nativeToken: 'PHA',
    paraId: 2035,
    vestingMethod: 'vesting.vest',
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  equilibrium: {
    name: 'Equilibrium',
    icon: 'equilibrium.svg',
    node: resolveOnfinalityUrl('Equilibrium'),
    disabled: true,
    nativeToken: 'EQ',
    paraId: 2011,
    vestingMethod: 'vesting.vest'
  },
  'hydra-dx': {
    name: 'HydraDX',
    icon: 'snakenet.svg',
    node: resolveOnfinalityUrl('hydradx'),
    paraId: 2034,
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  'nodle': {
    name: 'Nodle',
    node: resolveOnfinalityUrl('nodle-parachain'),
    icon: 'nodle.svg',
    paraId: 2026,
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  'coinversation': {
    name: 'Coinversation',
    node: '',
    icon: 'coinversation.png',
    paraId: 2027
  },
  'polkadex-polkadot': {
    name: 'Polkadex',
    icon: 'polkadex.svg',
    node: resolveOnfinalityUrl('polkadex'),
    disabled: true,
    nativeToken: 'PDEX',
    paraId: 2040,
    isTransferable: true
  },
  unique: {
    name: 'Unique Network',
    icon: 'unique.svg',
    node: resolveOnfinalityUrl('unique'),
    disabled: true,
    nativeToken: 'UNQ',
    paraId: 2037,
    vestingMethod: 'vesting.claim'
  },
  geminis: {
    name: 'Geminis',
    icon: 'geminis.png',
    node: '',
    paraId: 2038
  },
  originTrail: {
    name: 'OriginTrail',
    icon: 'origintrail.jpeg',
    node: 'wss://parachain-rpc.origin-trail.network',
    paraId: 2043,
    vestingMethod: 'vesting.vest'
  },
  kylin: {
    name: 'Kylin',
    icon: 'kylin.png',
    node: 'wss://polkadot.kylin-node.co.uk',
    disabled: true,
    nativeToken: 'KYL',
    paraId: 2052,
    vestingMethod: 'vesting.vest'
  }
}

const addRelayChainToNetworks = (networks: Networks, relayChainName: RelayChain) => {
  for (const key in networks) {
    networks[key].relayChain = relayChainName
  }

  return networks
}

const networks = {
  ...standalones,
  ...addRelayChainToNetworks(kusamaParachains, 'kusama'),
  ...addRelayChainToNetworks(polkadotParachains, 'polkadot')
}

export default networks
