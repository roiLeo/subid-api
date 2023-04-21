import { newLogger } from '@subsocial/utils'
import { axiosGetRequest } from '../utils'
import { HasMetadata, createRmrk2Url, parseRmrk2Nfts, parseRmrk1Nfts } from './utils'
import { getClient } from '@kodadot1/uniquery'
const client = getClient('rmrk')

const getRmrk1NftsByAccount = async (account) => {
  const res = await client.fetch<any>(client.itemListByOwner(account))
  return res?.data.items
}

const log = newLogger('RMRK Nft')

export const getRmrkNftsByAccount = async (account: string) => {
  try {
    const [ rmrk1Nfts, rmrk2Nfts ] = await Promise.all([
      getRmrk1NftsByAccount(account),
      axiosGetRequest(createRmrk2Url(account)),
    ]) as HasMetadata[][]

    const [ rmrk1, rmrk2 ] = await Promise.all([
      parseRmrk1Nfts(rmrk1Nfts),
      parseRmrk2Nfts(rmrk2Nfts)
    ])

    return {
      rmrk1,
      rmrk2
    }
  } catch (err) {
    log.error(err)
    return undefined
  }
}
