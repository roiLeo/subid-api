import { Router } from 'express'
import { Apis } from '../../connections/networks/types'
import {
  getStakingCandidatesInfo,
  getSelectedCandidates,
  getStakingCandidates,
  getDelegatorState,
  getScheduledRequests,
  getStakingRound,
  getChainConsts
} from '../../services/collatorStaking/index'

const createCollatorStakingRouter = (apis: Apis) => {
  const router = Router()

  router.get('/candidates/list/:chain/', async function (req, res) {
    const { chain } = req.params
    const info = await getStakingCandidates({
      apis,
      chain
    })

    res.send(info)
  })

  router.get('/candidates/info', async function (req, res) {
    const { network, accounts } = req.query

    const info = await getStakingCandidatesInfo({
      apis,
      chain: network as string,
      accounts: accounts as string[]
    })

    res.send(info)
  })

  router.get('/selected/:chain/', async function (req, res) {
    const { chain } = req.params
    const info = await getSelectedCandidates({
      apis,
      chain
    })

    res.send(info)
  })

  router.get('/delegators/state', async function (req, res) {
    const { network, accounts } = req.query
    const info = await getDelegatorState({
      apis,
      chain: network as string,
      accounts: accounts as string []
    })

    res.send(info)
  })

  router.get('/scheduled/requests', async function (req, res) {
    const { network, accounts } = req.query
    const info = await getScheduledRequests({
      apis,
      chain: network as string,
      accounts: accounts as string []
    })

    res.send(info)
  })

  router.get('/round/:chain/', async function (req, res) {
    const { chain } = req.params
    const info = await getStakingRound({
      apis,
      chain
    })

    res.send(info)
  })

  router.get('/consts/:network', async function (req, res) {
    const { network } = req.params
    const constsByNetwork = await getChainConsts(apis, network)
    res.send(constsByNetwork)
  });

  return router
}

export default createCollatorStakingRouter