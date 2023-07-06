import { getRmrkNftsByAccount } from "./rmrk"
import { GetDataByAccountProps } from "../types"
import { getStatemineNftsByAccount } from "./statemine"

const resOrDefault = <T>(res: PromiseSettledResult<T>) => {
  return res.status === 'fulfilled' ? res.value : []
}

export const getNftsByAccount = async ({
  account,
  apis
}: GetDataByAccountProps) => {

  // TODO: unique NFT is close now, because team move NFTs from testnet to mainnet
  const [ rmrkRes, statemineRes ] = await Promise.allSettled([
    getRmrkNftsByAccount(account),
    getStatemineNftsByAccount(apis.statemine, account),
  ])

  return {
    ...resOrDefault(rmrkRes),
    statemine: resOrDefault(statemineRes),
  }
}