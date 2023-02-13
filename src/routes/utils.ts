import { isEthereumAddress } from '@polkadot/util-crypto'
import { isAccountId } from '@subsocial/api'
import { Request } from 'express'
import networks from '../connections/networks'
import { relayChains } from '../services/crowdloan/types'

export const checkAccount = (req, res, next) => {
  const { account, network } = req.params
  const networkInfo = networks[network]

  if (isAccountId(account) || (networkInfo?.isEthLike && isEthereumAddress(account))) {
    next()
  } else {
    res.status(401).send("Account is not valid!")
  }
}

export const checkRelayChain = (req, res, next) => {
  const { relayChain } = req.params

  if (!relayChains.includes(relayChain)) {
    res.status(404).send('Network is not relay chain!')
  }
  next()
}

export const convertQueryToStringArray = (queryData: Request['query'][string]) => {
  return (Array.isArray(queryData) ? queryData : [ queryData ]) as string[]
}
