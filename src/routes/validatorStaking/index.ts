import { Router } from 'express'
import { getStakingProps } from '../../services/validatorStaking/consts'
import { asyncErrorHandler } from '../../services/utils'
import createNominatorsRouter from './nominators'
import { 
  getValidatorsList, 
  getCurrentEra, 
  getRewardsByNominator
} from '../../services/validatorStaking/index'
import { Connections } from '../../connections'

const createValidatorStakingRouter = (apis: Connections) => {
  const router = Router()

  router.get('/list/:network/', async function (req, res) {
    const { network } = req.params
    const info = await getValidatorsList({
      apis: apis.wsApis,
      network
    })

    res.send(info)
  })

  router.get('/props/:network/', async function (req, res) {
    const { network } = req.params
    const info = await getStakingProps({
      apis: apis.mixedApis,
      network
    })

    res.send(info)
  })

  router.get('/era/current/:network/', async function (req, res) {
    const { network } = req.params
    const info = await getCurrentEra({
      apis: apis.mixedApis,
      network,
    })

    res.send(info)
  })

  router.get('/reward/:network/:account', async function (req, res) {
    const { network, account } = req.params
    const info = await getRewardsByNominator({
      apis: apis.mixedApis,
      network,
      account
    })

    res.send(info)
  })

  router.use('/nominator', asyncErrorHandler(createNominatorsRouter(apis.mixedApis)))

  return router
}

export default createValidatorStakingRouter