import { resolveSubsocialApi } from '../connections'
import { WithApis } from './types'
import { runQueryOrUndefined, toGenericAccountId } from './utils';
import { Registration } from '@polkadot/types/interfaces'
import { hexToString } from '@polkadot/util'
import { ApiPromise } from '../connections/networks/types'
import { Option } from '@polkadot/types';
import { isEmptyArray, isEmptyObj } from '@subsocial/utils';
import { pick } from 'lodash'

const identitiesInfo = {}

let lastUpdate = new Date().getTime()
const updateDelay = 24 * 3600 * 1000 //seconds

const needUpdate = () => {
  const now = new Date().getTime()

  if (now > lastUpdate + updateDelay) {
    lastUpdate = now
    return true
  }

  return false
}

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

const parseIdentity = (
  chain: string, 
  accounts: string[], 
  accountsWithSubIdentity: string[], 
  superOfMultiObj: Record<string, any>, 
  identities?: Option<any>[]
) => {
  if (!identities) return undefined

  const parsedIdentities = {}

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

  accounts.forEach((account)=> {
    const genericAccountId = toGenericAccountId(account)

    const identity = parsedIdentities[toGenericAccountId(genericAccountId)] || {}

    if(!isEmptyObj(identity)) {
      identitiesInfo[chain][genericAccountId] = identity
      return
    }

    const superOf = superOfMultiObj[genericAccountId] || {}

    const parent = superOf?.parent
    
    const genericAccount = parent ? toGenericAccountId(parent) : ''
    
    const parentIdentity = parsedIdentities[genericAccount] || {}
    
    if(isEmptyObj(parentIdentity)) return

    identitiesInfo[chain][genericAccountId] = {
      info: {
        display: `${parentIdentity.info.display}/${superOf.raw}`
      }
    }
  })
}

const getIdentity = async (api: ApiPromise, accounts: string[], chain: string) => {
  const forceUpdate = needUpdate && needUpdate()
  const cacheDataByChain = identitiesInfo?.[chain]

  const needFetch = cacheDataByChain ? accounts.filter(account => !Object.keys(cacheDataByChain).includes(account)) : []

  if (!cacheDataByChain) {
    identitiesInfo[chain] = {}
  }

  if (!isEmptyArray(needFetch)) {
    const accountsToFetch = forceUpdate ? accounts : needFetch
    const superOfMulti = await api.query.identity.superOf.multi(accountsToFetch) as Option<any>[]

    const superOfMultiObj = {}
    const parentIds = []

    accountsToFetch.forEach((account, i) => {
      const superOf = superOfMulti[i].unwrapOr(undefined)

      if(!superOf) return

      const [ key, value ] = superOf

      const parentId = key.toHuman()

      parentIds.push(toGenericAccountId(parentId))

      superOfMultiObj[account] = {
        parent: parentId,
        raw: hexToString(value.toJSON()['raw'])
      }
    })

    const accountsWithSubIdentity = [...accountsToFetch, ...parentIds]

    const identities = (await api.query.identity.identityOf.multi(accountsWithSubIdentity)) as Option<any>[]
    parseIdentity(chain, accountsToFetch, accountsWithSubIdentity, superOfMultiObj, identities)    
  }

  const result = pick(identitiesInfo[chain], accounts)

  return result
}

export const getIdentities = async ({
  apis: { kusama, polkadot, shiden, subsocial },
  accounts
}: GetIdentitiesProps) => {
  const identities = {}

  const subsocialApi = resolveSubsocialApi(subsocial)

  const [kusamaIdentity, polkadotIdentity, shidenIdentity, subsocialIdentity] = await Promise.all([
    runQueryOrUndefined(kusama, async (api) => getIdentity(api, accounts, 'kusama')),
    runQueryOrUndefined(polkadot, async (api) => getIdentity(api, accounts, 'polkadot')),
    runQueryOrUndefined(shiden, async (api) => getIdentity(api, accounts, 'shiden')),
    runQueryOrUndefined(subsocialApi, async (api) => {
      const subsocialIdentities = {}

      const spaces = await api.findProfileSpaces(accounts)

      spaces.forEach((space) => {
        subsocialIdentities[toGenericAccountId(space.struct.ownerId)] = space
      })
      
      return subsocialIdentities
    })
  ])

  accounts.forEach(account => {
    identities[account] = {
      kusama: kusamaIdentity?.[account],
      polkadot: polkadotIdentity?.[account],
      shiden: shidenIdentity?.[account],
      subsocial: subsocialIdentity?.[account],
    }
  })

  return identities
}
