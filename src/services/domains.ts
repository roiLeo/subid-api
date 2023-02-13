import { WithApis } from './types'
import { runQueryOrUndefined } from './utils'

type GetRegisteredDomainsProps = WithApis & {
  domain: string
};

export const getRegisteredDomains = async ({
  apis,
  domain
}: GetRegisteredDomainsProps) => {
  const subsocial = apis.subsocial

  const domainStructOpt = await runQueryOrUndefined(subsocial, (api) =>
    api.query.domains.registeredDomains(domain.toLocaleLowerCase()))
  
  const domainStruct = domainStructOpt?.unwrapOr(undefined)

  if (!domainStruct) return undefined

  return {
    ...domainStruct.toHuman(),
    expiresAt: domainStruct.expiresAt.toString(),
    innerValue: domainStruct.innerValue,
    outerValue: domainStruct.outerValue.toHuman()
  }
}

type GetDomainBySpaceIdProps = WithApis & {
  spaceId: string
  account: string
};

export const getDomainByAccountAndSpaceId = async ({
  apis,
  spaceId,
  account
}: GetDomainBySpaceIdProps) => {
  const subsocial = apis.subsocial

  const domainStruct = await runQueryOrUndefined(subsocial, (api) =>
    api.query.domains.domainByInnerValue(account, { Space: spaceId }))

  return domainStruct?.toHuman()
}

type GetDomainByAccountProps = WithApis & {
  account: string
};

export const getDomainsByAccount = async ({
  apis,
  account
}: GetDomainByAccountProps) => {
  const subsocial = apis.subsocial

  const domains = await runQueryOrUndefined(subsocial, (api) =>
    api.query.domains.domainsByOwner(account))

  return domains?.toHuman()
}

type IsReserveWordProps = WithApis & {
  word: string
};

export const isReservedWord = async ({
  apis,
  word
}: IsReserveWordProps) => {
  const subsocial = apis.subsocial

  const isReserve = await runQueryOrUndefined(subsocial, (api) =>
    api.query.domains.reservedWords(word))

  return isReserve?.toHuman()
}

