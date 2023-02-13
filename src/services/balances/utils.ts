import { ApiPromise } from '../../connections/networks/types'
import BN from 'bn.js'
import { getGenshiroTokens } from './genshiro'
import { getOrUpdatePropertiesByNetwork } from '../properties'
import { asTypesGenerator } from '../../utils'

export type TokenBalances = Record<string, any>

const getNativeTokenBalance = async (api: ApiPromise, account: string) => {
  const { data: { feeFrozen, free, miscFrozen, reserved } }: any =
    await api.query.system.account(account)

  return parseBalances(free, reserved, feeFrozen, { frozenMisc: miscFrozen?.toString() })
}

type Balances = {
  freeBalance: string
  reservedBalance: string
  frozenFee: string
  totalBalance: string
}

export const parseBalances = (free?: BN, reserved?: BN, frozen?: BN, other?: Record<string, any>) => {
  const totalBalance = reserved ? free.add(reserved) || 0 : free

  return {
    freeBalance: free?.toString(),
    reservedBalance: reserved?.toString(),
    frozenFee: frozen?.toString(),
    totalBalance: totalBalance?.toString(),
    ...other
  }
}

type GetBalancesType = (api: ApiPromise, network: string, account: string, tokens?: any[]) => Promise<TokenBalances>

type TokenBalanceData = {
  free?: BN
  frozen?: BN
  reserved?: BN
}
function defaultOrmlTokenGetter (api: ApiPromise, { account, token }: { account: string, token: any }): Promise<TokenBalanceData> {
  return api.query.tokens.accounts(account, token) as any
}

const customOrmlTokenGetter = asTypesGenerator<
  (...params: Parameters<typeof defaultOrmlTokenGetter>) => ReturnType<typeof defaultOrmlTokenGetter>
>()({
  'assets.account': async (api, { account, token }) => {
    const balancesCodec = await api.query.assets.account(token, account)
    const data = balancesCodec.toPrimitive()
    const { isFrozen, balance } = data || {} as any
    const balanceData: TokenBalanceData = {
      free: new BN(0),
      frozen: new BN(0),
    }
    balanceData[isFrozen ? 'frozen' : 'free'] = new BN(balance)
    return balanceData
  },
  'ormlTokens.accounts': (api, { account, token }) => {
    return api.query.ormlTokens.accounts(account, token) as any
  }
})
const ormlTokenGetterNetworkMapper: { [key: string]: keyof typeof customOrmlTokenGetter } = {
  astar: 'assets.account',
  shiden: 'assets.account',
  statemine: 'assets.account',
  statemint: 'assets.account',
  pichiu: 'assets.account',
  calamari: 'assets.account',
  manta: 'assets.account',
  moonbeam: 'assets.account',
  moonriver: 'assets.account',
  parallel: 'assets.account',
  parallelHeiko: 'assets.account',
  phala: 'assets.account',
  khala: 'assets.account',
  altair: 'ormlTokens.accounts',
  centrifuge: 'ormlTokens.accounts',
  shadow: 'ormlTokens.accounts',
}

const getOrmlTokens: GetBalancesType = async (api, network, account, tokens) => {
  const tokenBalances: TokenBalances = {}

  const balanceGetter = customOrmlTokenGetter[ormlTokenGetterNetworkMapper[network] ?? ''] ?? defaultOrmlTokenGetter
  const balancePromise = tokens.map(async (token) => {
    try {
      let balances = {} as unknown as Balances
      const isObject = typeof token === 'object'

      const balancesCodec = await balanceGetter(api, {
        account: account,
        token: isObject ? token.currency : { Token: token }
      })
      const { free, frozen, reserved } = balancesCodec as any
      balances = parseBalances(free, reserved, frozen)

      tokenBalances[isObject ? token.symbol : token] = {
        ...balances
      }
    } catch {
      // ok
    }
  })

  await Promise.all(balancePromise)

  return tokenBalances
}

const getOnlyOrmlTokens = async (api: ApiPromise, account: string, network: string) =>{
  const props = await getOrUpdatePropertiesByNetwork(api, network)
  const tokenSymbols = props.tokenSymbols as string[]
  const tokens = props.assetsRegistry as Record<string, any>

  return getOrmlTokens(api, network, account, [...tokenSymbols, ...Object.values(tokens)])
}

const getNativeAndOrmlTokens = async (api: ApiPromise, account: string, network: string) => {
  const tokenBalances: TokenBalances = {}

  const props = await getOrUpdatePropertiesByNetwork(api, network)
  const tokenSymbols = props.tokenSymbols as string[]
  const tokens = props.assetsRegistry as Record<string, any>
  const [native] = tokenSymbols

  tokenBalances[native] = await getNativeTokenBalance(api, account)
  const ormlBalances = await getOrmlTokens(api, network, account, Object.values(tokens))

  return {
    ...ormlBalances,
    ...tokenBalances
  }
}

type GetOrmlBalancesType = (api: ApiPromise, account: string, network: string, tokens?: any[]) => Promise<TokenBalances>

const customFetchBalancesByNetwork: Record<string, GetOrmlBalancesType> = {
  kintsugi: getOnlyOrmlTokens,
  interlay: getOnlyOrmlTokens,
  genshiro: getGenshiroTokens
}

export const getTokensFnByNetwork = (network) => {
  return customFetchBalancesByNetwork[network] || getNativeAndOrmlTokens
}
