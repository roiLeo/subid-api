import { Router } from 'express'
import { Apis } from '../../connections/networks/types'
import { RelayChain } from '../../services/crowdloan/types'
import polkadotJSON from '../../../public/contributions/polkadot-contributors.json'
import kusamaJSON from '../../../public/contributions/kusama-contributors.json'
import { getCouncilMembersByRelayChain } from '../../services/interestingAccounts/council'
import { getValidatorsFromRelayChain } from '../../services/interestingAccounts/validators'
import { getLimitFromRequest, getOffsetFromRequest, checkAndSendData } from './utils'
import {
  getAllTabData,
  getAccountsOverviewItems,
  getAllAccountsLength
} from '../../services/interestingAccounts/all'

const contributions = {
  polkadot: polkadotJSON,
  kusama: kusamaJSON
}

const createInterestingAccountsRouter = (apis: Apis) => {
  const router = Router()

  router.get('/all/:selectedChain', async function (req, res) {
    const { selectedChain } = req.params
    const offset = getOffsetFromRequest(req)
    const limit = getLimitFromRequest(req)

    const data = await getAllTabData({ apis, offset, limit, selectedChain })

    checkAndSendData(data, res)
  })

  router.get('/length', async function (_req, res) {
    const data = await getAllAccountsLength(apis)
    if (data === null) {
      res.status(404).send('Invalid type provided')
    }

    res.send(data.toString())
  })

  router.get('/overview', async function (_req, res) {
    const data = await getAccountsOverviewItems(apis)

    checkAndSendData(data, res)
  })

  router.get('/:relayChain/council', async function (req, res) {
    const { relayChain } = req.params
    const offset = getOffsetFromRequest(req)
    const limit = getLimitFromRequest(req)

    const councilMembers = await getCouncilMembersByRelayChain({
      apis,
      offset,
      limit,
      relayChain: relayChain as RelayChain
    })

    res.send(councilMembers)
  })

  router.get('/:relayChain/validators', async function (req, res) {
    const { relayChain } = req.params
    const offset = getOffsetFromRequest(req)
    const limit = getLimitFromRequest(req)

    const validators = await getValidatorsFromRelayChain({
      apis,
      offset,
      limit,
      relayChain: relayChain as RelayChain
    })

    res.send(validators)
  })

  type InterestingAccountsTuple = [string, unknown][]

  router.get('/:relayChain/contributors', async function (req, res) {
    const { relayChain } = req.params
    const offset = getOffsetFromRequest(req)
    const limit = getLimitFromRequest(req)

    const contributors: InterestingAccountsTuple = Object.entries(contributions[relayChain]).slice(offset, offset + limit)

    const contributorsObj = contributors.map(([contributor, amount]) => {
      return {
        account: contributor,
        amount
      }
    })
    res.send(contributorsObj)
  })

  return router
}

export default createInterestingAccountsRouter
