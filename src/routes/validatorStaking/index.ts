import { Router } from 'express'
import { Apis } from '../../connections/networks/types'
import { getStakingProps } from '../../services/validatorStaking/consts'
import { asyncErrorHandler } from '../../services/utils'
import createNominatorsRouter from './nominators'
import { 
  getValidatorsList, 
  getCurrentEra, 
  getRewardsByNominator
} from '../../services/validatorStaking/index'

const createValidatorStakingRouter = (apis: Apis) => {
  const router = Router()

  router.get('/list/:network/', async function (req, res) {
    const { network } = req.params
    const info = await getValidatorsList({
      apis,
      network
    })

    res.send(info)
  })

  router.get('/props/:network/', async function (req, res) {
    const { network } = req.params
    const info = await getStakingProps({
      apis,
      network
    })

    res.send(info)
  })

  router.get('/era/current/:network/', async function (req, res) {
    const { network } = req.params
    const info = await getCurrentEra({
      apis,
      network,
    })

    res.send(info)
  })

  router.get('/reward/:network/:account', async function (req, res) {
    const { network, account } = req.params
    const info = await getRewardsByNominator({
      apis,
      network,
      account
    })

    res.send(info)
  })

  router.use('/nominator', asyncErrorHandler(createNominatorsRouter(apis)))

  return router
}

export default createValidatorStakingRouter