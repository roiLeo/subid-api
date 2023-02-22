import { ApiPromise } from '@polkadot/api'
import { encodeAddress } from '@polkadot/util-crypto'
import { gql } from 'graphql-request'
import { newLogger } from '@subsocial/utils'
import { isApiConnected } from '../utils'
import { quartzClient } from '../../constant/graphQlClients'

const log = newLogger('UniqueNft')

const getNftsByAccountQuery = gql`
  query getNftsByAccount($account: String!) {
    tokens(where: {owner: {_eq: $account}}) {
      id
      token_id
      collection_id
      data
    }
  }
`

const getCollectionByIdQuery = gql`
  query getCollectionById ($id: bigint!) {
    collections(where: {collection_id: {_eq: $id}}) {
      description
      name
      token_prefix
    }
  }
`

type Collection = {
  name: string,
  token_prefix: string,
}

const collectionById: Record<number, Collection> = {}

const parseCollectionRes = (data) => data.collections[0]

const getCollectionById = async (id: number) => {
  if (!collectionById[id]) {
    collectionById[id] = parseCollectionRes(await quartzClient.request(getCollectionByIdQuery, { id }))
  }

  return collectionById[id]
}

const getCollectionsByIds = async (ids: number[]) => {
  await Promise.all([ ...new Set(ids) ].map(getCollectionById))

  return collectionById
}

type QuartzNft = {
  id: number
  token_id: number,
  collection_id: number,
  data: {
    ipfsJson: string
  }
}

const uniqueDefaultIpfsJson = {
  ipfs: 'QmPCqY7Lmxerm8cLKmB18kT1RxkwnpasPVksA8XLhViVT7',
  type: 'image'
}

const quartzGateway = 'https://ipfs.unique.network/ipfs'

const buildLink = ({ token_id, collection_id }: QuartzNft) => `https://uniquescan.io/QUARTZ/tokens/${collection_id}/${token_id}`

export const getQuartzNftsByAccount = async (api: ApiPromise, account: string) => {
  if (!isApiConnected(api)) return undefined

  try {
    const variables = {
      account: encodeAddress(account, api.registry.chainSS58),
    }

    const { tokens } = await quartzClient.request(getNftsByAccountQuery, variables)
    const nfts = tokens as QuartzNft[]
    const collectionIds = nfts.map(x => x.collection_id)
    const collectionById = await getCollectionsByIds(collectionIds)

    return nfts.map(nft => {
      const { id, token_id, collection_id, data: { ipfsJson } } = nft

      const { ipfs, type } = ipfsJson ? JSON.parse(ipfsJson) : uniqueDefaultIpfsJson

      const { token_prefix, name: collectionName } = collectionById[collection_id]

      const name = `${token_prefix || collectionName} #${token_id}`

      return {
        id,
        name: name,
        contentType: type,
        image: `${quartzGateway}/${ipfs}`,
        link: buildLink(nft),
        stubImage: 'unique.svg'
      }
    })

  } catch (err) {
    log.error(err)
    return undefined
  }
}


