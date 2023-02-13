import { Router } from 'express'

import { Apis } from '../../connections/networks/types'
import { 
  getNominators, 
  getStakingLegder, 
  getRewardDestination, 
  getController, 
  getNominatorInfo 
} from '../../services/validatorStaking/nominatorInfo'

type StakingQueryType = {
  network: string
  account: string
}

const createNominatorsRouter = (apis: Apis) => {
  const router = Router()

  router.get('/info/', async function (req, res) {
    const { network, account } = req.query as StakingQueryType
    const info = await getNominatorInfo({
      apis,
      network,
      account
    })

    res.send(info)
  })

  router.get('/controller/', async function (req, res) {
    const { network, account } = req.query as StakingQueryType
    const info = await getController({
      apis,
      network,
      account
    })

    res.send(info)
  })

  router.get('/payee/', async function (req, res) {
    const { network, account } = req.query as StakingQueryType
    const info = await getRewardDestination({
      apis,
      network,
      account
    })

    res.send(info)
  })

  router.get('/ledger/', async function (req, res) {
    const { network, account } = req.query as StakingQueryType
    const info = await getStakingLegder({
      apis,
      network,
      account
    })

    res.send(info)
  })

  router.get('/nominators/', async function (req, res) {
    const { network, account } = req.query as StakingQueryType
    const info = await getNominators({
      apis,
      network,
      account
    })

    res.send(info)
  })

  return router
}

export default createNominatorsRouter