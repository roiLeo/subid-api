import { getRmrkNftsByAccount } from "./rmrk"
import { GetDataByAccountProps } from "../types"
import { getStatemineNftsByAccount } from "./statemine"
import { getKaruraNftsByAccount } from "./karura"
// import { getQuartzNftsByAccount } from "./quartz"

const resOrDefault = <T>(res: PromiseSettledResult<T>) => {
  return res.status === 'fulfilled' ? res.value : []
}

export const getNftsByAccount = async ({
  account,
  apis
}: GetDataByAccountProps) => {

  // TODO: unique NFT is close now, because team move NFTs from testnet to mainnet
  const [ /* quartzRes, */ rmrkRes, statemineRes, karuraRes, acalaRes ] = await Promise.allSettled([
    // getQuartzNftsByAccount(apis.quartz, account),
    getRmrkNftsByAccount(account),
    getStatemineNftsByAccount(apis.statemine, account),
    getKaruraNftsByAccount(apis.karura, account, 'karura.svg'),
    getKaruraNftsByAccount(apis.acala, account, 'acala.svg')
  ])

  return {
    // unique: resOrDefault(quartzRes),
    ...resOrDefault(rmrkRes),
    statemine: resOrDefault(statemineRes),
    karura: resOrDefault(karuraRes),
    acala: resOrDefault(acalaRes)
  }
}