import { WithApis, SubsocialProfilesResult } from './types'
import { /* runQueryOrUndefined, */ toGenericAccountId } from './utils'
import { Registration } from '@polkadot/types/interfaces'
import { hexToString } from '@polkadot/util'
import { ApiPromise } from '../connections/networks/types'
import { Option } from '@polkadot/types'
import { isEmptyArray, isEmptyObj, isDef } from '@subsocial/utils'
import { pick } from 'lodash'
import { gql } from 'graphql-request'
import { encodeAddress } from '@polkadot/util-crypto'
import { subsocialGraphQlClient } from '../constant/graphQlClients'
import Cache from '../cache'


const updateDelay = 24 * 3600 * 1000 //seconds
const identitiesInfoCache = new Cache<any>('identities', updateDelay)

type Field = {
  raw: string
}

const identityFieldsToString = (fields: Record<string, Field>) => {
  if (!fields) return undefined

  const newFields = {}

  for (const key in fields) {
    const { raw } = fields[key]
    newFields[key] = hexToString(raw?.toString())
  }

  return newFields
}

type GetIdentitiesProps = WithApis & {
  accounts: string[]
}

const parseIdentity = async (
  chain: string,
  accounts: string[],
  accountsWithSubIdentity: string[],
  superOfMultiObj: Record<string, any>,
  identities?: Option<any>[]
) => {
  if (!identities) return undefined
  const identityByChain = await identitiesInfoCache.get(chain)

  const parsedIdentities = {}
  const identityByAccount = {}

  identities?.forEach((identityOpt, i) => {
    const identity = identityOpt.unwrapOr(undefined) as Registration | undefined

    if (!identity) return undefined

    const account = accountsWithSubIdentity[i]

    const {
      info: { additional, pgpFingerprint, ...fields },
      judgements
    } = identity.toJSON() as any

    const isVerify = !!judgements.filter((x) => x[1].isReasonable).length

    const value = {
      isVerify,
      info: {
        additional,
        pgpFingerprint,
        ...identityFieldsToString(fields)
      }
    }

    parsedIdentities[account] = value
  })

  accounts.forEach((account) => {
    const genericAccountId = toGenericAccountId(account)

    const identity = parsedIdentities[toGenericAccountId(genericAccountId)] || {}

    if (!isEmptyObj(identity)) {
      identityByAccount[genericAccountId] = identity
      return
    }

    const superOf = superOfMultiObj[genericAccountId] || {}

    const parent = superOf?.parent

    const genericAccount = parent ? toGenericAccountId(parent) : ''

    const parentIdentity = parsedIdentities[genericAccount] || {}

    if (isEmptyObj(parentIdentity)) return

    identityByAccount[genericAccountId] = {
      info: {
        display: `${parentIdentity.info.display}/${superOf.raw}`
      }
    }
  })

  await identitiesInfoCache.set(chain, { ...identityByChain, ...identityByAccount })
}

export const getIdentity = async (api: ApiPromise, accounts: string[], chain: string) => {
  const needUpdate = identitiesInfoCache.needUpdate

  const forceUpdate = needUpdate && await needUpdate()
  const cacheDataByChain = await identitiesInfoCache.get(chain)

  const cachedDataKeys = cacheDataByChain ? Object.keys(cacheDataByChain) : []
  
  const needFetch = cacheDataByChain
  ? accounts.filter((account) => !cachedDataKeys.includes(account))
  : accounts

  if (!isEmptyArray(needFetch)) {
    const accountsToFetch = forceUpdate ? accounts : needFetch
    const superOfMulti = (await api.query.identity.superOf.multi(accountsToFetch)) as Option<any>[]

    const superOfMultiObj = {}
    const parentIds = []

    accountsToFetch.forEach((account, i) => {
      const superOf = superOfMulti[i].unwrapOr(undefined)

      if (!superOf) return

      const [key, value] = superOf

      const parentId = key.toHuman()

      parentIds.push(toGenericAccountId(parentId))

      superOfMultiObj[account] = {
        parent: parentId,
        raw: hexToString(value.toJSON()['raw'])
      }
    })

    const accountsWithSubIdentity = [...accountsToFetch, ...parentIds]

    const identities = (await api.query.identity.identityOf.multi(accountsWithSubIdentity)) as Option<any>[]
    await parseIdentity(chain, accountsToFetch, accountsWithSubIdentity, superOfMultiObj, identities)
  }

  const updatedIdentityInfo = await identitiesInfoCache.get(chain)

  const result = pick(updatedIdentityInfo, accounts)

  return result
}

export const GET_SUBSOCIAL_PROFILES = gql`
  query GetProfilesData($ids: [String!]) {
    accounts(where: { id_in: $ids }) {
      profileSpace {
        content
        createdAtBlock
        createdAtTime
        createdByAccount {
          id
        }
        email
        name
        linksOriginal
        hidden
        id
        updatedAtTime
        postsCount
        image
        tagsOriginal
        summary
        about
        ownedByAccount {
          id
        }
        experimental
      }
    }
  }
`

const getSubsococilaIdentity = async (accounts: string[]) => {
  const subsocialIdentities = {}

  const encodedAccounts = accounts.map(account => encodeAddress(account, 28))
  const spaces: SubsocialProfilesResult = 
    await subsocialGraphQlClient.request(GET_SUBSOCIAL_PROFILES, { ids: encodedAccounts })

  spaces.accounts.forEach((space) => {
    const profileSpace = space.profileSpace

    if(profileSpace) {
      subsocialIdentities[toGenericAccountId(profileSpace.ownedByAccount.id)] = profileSpace
    }
  })

  return subsocialIdentities
}

export const getIdentities = async ({
  // apis: { kusama, polkadot, shiden },
  accounts
}: GetIdentitiesProps) => {
  const identities = {}

  const filteredAccounts = accounts.filter(account => isDef(account) && !!account)

  const [/* kusamaIdentity, polkadotIdentity, shidenIdentity,  */subsocialIdentity] = await Promise.all([
    // runQueryOrUndefined(kusama, async (api) => getIdentity(api, filteredAccounts, 'kusama')),
    // runQueryOrUndefined(polkadot, async (api) => getIdentity(api, filteredAccounts, 'polkadot')),
    // runQueryOrUndefined(shiden, async (api) => getIdentity(api, filteredAccounts, 'shiden')),
    getSubsococilaIdentity(filteredAccounts)
  ])

  filteredAccounts.forEach((account) => {
    identities[account] = {
      // kusama: kusamaIdentity?.[account],
      // polkadot: polkadotIdentity?.[account],
      // shiden: shidenIdentity?.[account],
      subsocial: subsocialIdentity?.[account]
    }
  })

  return identities
}
