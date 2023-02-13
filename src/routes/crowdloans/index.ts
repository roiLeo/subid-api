import { Router } from 'express'

import { Apis } from '../../connections/networks/types'
import { checkAccount, checkRelayChain, convertQueryToStringArray } from '../utils'
import {
  getCrowdloansContributionsByAccountInNetwork,
} from '../../services/crowdloan/contributions'
import { RelayChain } from '../../services/crowdloan/types'
import { getCrowdloansByRelayChain } from '../../services/crowdloan/info'
import { getCrowdloanVestingByAccount } from '../../services/crowdloan/vesting'

const createCrowdloansRouter = (apis: Apis) => {
  const router = Router()

  router.get('/contributions/:relayChain/:account', checkRelayChain, checkAccount, async function (req, res) {
    const { account, relayChain } = req.params
    const info = await getCrowdloansContributionsByAccountInNetwork({
      apis,
      account,
      relayChain: relayChain as RelayChain
    })
    res.send(info)
  })

  router.get('/vesting/:account', checkAccount, async function (req, res) {
    const { account } = req.params
    const { network, noCache } = req.query
    const networks = convertQueryToStringArray(network)
    const info = await getCrowdloanVestingByAccount({
      account,
      networks,
      apis,
      noCache: noCache === 'true'
    })
    res.send(info)
  })

  router.get('/:relayChain', checkRelayChain, async function (req, res) {
    const { relayChain } = req.params
    const info = await getCrowdloansByRelayChain({
      apis,
      relayChain: relayChain as RelayChain
    })
    res.send(info)
  })

  return router
}

export default createCrowdloansRouter
