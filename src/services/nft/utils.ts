import { axiosGetRequest } from "../utils"

export type HasMetadata = {
  id: string
  sn: string
  forsale: string
  metadata: string,
  name: string,
  metadata_content_type?: string,
  link?: string,
  image?: string,
  idForLink: string
}

type CommissionPercentages = {
  service: number,
  royalty?: number
}

export const createRmrk2Url = (account: string) => `https://singular.rmrk-api.xyz/api/account/${account}`
// export const createKanariaBirdsRmrkUrl = (account: string) => `https://kanaria.rmrk.app/api/rmrk2/account-birds/${account}`
// export const createKanariaItemsrRmrkUrl = (account: string) => `https://kanaria.rmrk.app/api/rmrk2/account-items/${account}`

const rmrkGateway = 'https://ipfs.rmrk.link'

const createIpfsUrl = (cidUrl?: string) => cidUrl?.startsWith('ipfs:/') ? cidUrl?.replace('ipfs:/', rmrkGateway) : cidUrl

type BuildLinkFn = (id: string) => string

const buildRmrk1Link: BuildLinkFn = (id) => `https://kodadot.xyz/rmrk/gallery/${id}`
const buildRmrk2Link: BuildLinkFn = (id) => `https://kodadot.xyz/ksm/gallery/${id}`
// const buildKanariaLink: BuildLinkFn = (id) => `https://kanaria.rmrk.app/catalogue/${id}`
const buildStatemineLink: BuildLinkFn = (id) => `https://kodadot.xyz/stmn/gallery/${id}`

export const parseKusamaNfts = (nfts: HasMetadata[], buildLink: BuildLinkFn, percentages: CommissionPercentages, stubImage?: string) => {
  const promises = nfts.map(async ({ metadata, forsale, id, idForLink, image: imageLink, name, metadata_content_type }) => {
    const content = await axiosGetRequest(createIpfsUrl(metadata))

    const contentType = metadata_content_type
    const animationUrl = createIpfsUrl(content?.animation_url)
    const image = createIpfsUrl(imageLink || content?.image || content?.mediaUri)

    const price = forsale
      ? getListPricePlusComissionBigInt(BigInt(forsale || 0), percentages).toString()
      : undefined

    return {
      id,
      name: name || content?.name,
      contentType,
      animationUrl,
      price,
      image,
      stubImage: stubImage || 'rmrk.svg',
      link: buildLink(idForLink || id)
    }
  })

  return Promise.all(promises)
}

const SINGULAR_COMMISSION_PERCENTAGES: CommissionPercentages = {
  service: 2
}

export const parseRmrk1Nfts = (nfts: HasMetadata[]) => parseKusamaNfts(nfts, buildRmrk1Link, SINGULAR_COMMISSION_PERCENTAGES)

const KANARIA_COMMISSION_PERCENTAGES: CommissionPercentages = {
  service: 2,
  royalty: 3
}

export const parseRmrk2Nfts = (nfts: HasMetadata[]) => parseKusamaNfts(nfts, buildRmrk2Link, KANARIA_COMMISSION_PERCENTAGES)
export const parseStatemineNfts = (nfts: HasMetadata[], stubImage: string) => parseKusamaNfts(nfts, buildStatemineLink, KANARIA_COMMISSION_PERCENTAGES, stubImage)

/**
 * Find out what was the RMRK commission from previously commissioned price
 * @param price in plancks
 * @param percentages
 */
export const reverseComissionsGet = (price: bigint, { service, royalty = 0 }: CommissionPercentages) => {
  const commission = service + royalty
  return (price * BigInt(commission)) / (BigInt(100) - BigInt(commission));
};


/**
 * Listing price with commission to display to BUYer
 * returns bigint plancks
 * @param price as bigint in plancks
 */
export const getListPricePlusComissionBigInt = (price: bigint, percentages: CommissionPercentages) => {
  const commisssion = reverseComissionsGet(price, percentages);
  return price + commisssion;
};
