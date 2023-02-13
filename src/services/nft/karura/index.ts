import { ApiPromise } from "@polkadot/api";
import { Option } from '@polkadot/types'
import { axiosGetRequest, isApiConnected } from "../../utils";
import { newLogger } from '@subsocial/utils'

type NftMeta = {
  name: string,
  description: string,
  image: string
}

const log = newLogger('KaruraNft')

const buildKaruraIpfsLink = (cid: string) => `https://cloudflare-ipfs.com/ipfs/${cid.replace('ipfs://', '')}`

const formatNftInformation = async (nftId: string, classInfoOpt: Option<any>, _tokenInfoOpt: Option<any>, stubImage) => {
  try {
    const classInfo = classInfoOpt.unwrapOrDefault()

    const classInfoMetadata = classInfo.metadata.toHuman()

    const data = await axiosGetRequest(buildKaruraIpfsLink(`${classInfoMetadata}/metadata.json`))

    if (!data) return undefined

    const { image, ...info} = data as NftMeta

    // const tokenInfo = tokenInfoOpt.unwrapOrDefault()
    // const price = tokenInfo?.data?.deposit?.toString()

    return {
      id: nftId,
      ...info,
      image: buildKaruraIpfsLink(image),
      stubImage,
      // price
    };
  } catch (e) {
    log.error(e);
    return undefined
  }
};

export const getKaruraNftsByAccount = async (api: ApiPromise, account: string, stubImage: string) => {
  if (!isApiConnected(api)) return undefined

  const tokensByOwner = await api.query.ormlNFT.tokensByOwner.entries(account)

  const nftPromises = tokensByOwner.map(async ([entity]) => {
    const [ , classes, _tokenId ] = entity.toHuman() as string[]

    const tokenId = _tokenId.split(',').join('')

    const items = await Promise.all([
      api.query.ormlNFT.classes(classes),
      api.query.ormlNFT.tokens(classes, tokenId)
    ])

    const nftId = `${classes}-${tokenId}`

    const [ classInfo, tokenInfo ] = items as unknown as Option<any>[]

    return formatNftInformation(nftId, classInfo, tokenInfo, stubImage)
  })

  return Promise.all(nftPromises)
}