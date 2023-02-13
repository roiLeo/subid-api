import { Router } from 'express'
import { Apis } from '../connections/networks/types'
import { getBalanceByAccount } from '../services/balances'
import { getDomainByAccountAndSpaceId, getDomainsByAccount } from '../services/domains'
import { getIdentities } from '../services/identity'
import { getNftsByAccount } from '../services/nft'
import { getPrices } from '../services/prices'
import { isApiConnected, asyncErrorHandler } from '../services/utils'
import createChainsRouter from './chains'
import createCrowdloansRouter from './crowdloans'
import createDomainsRouter from './domains'
import createHealthRouter from './health'
import createStatemineAssetsRouter from './statemine'
import createInterestingAccountsRouter from './interestingAccounts'
import { checkAccount } from './utils'
import createCollatorStakingRouter from './collatorStaking/index';
import createValidatorStakingRouter from './validatorStaking/index';
import createFeesRouter from './fees'

export const createRoutes = (apis: Apis) => {
  const router = Router()

  const checkNetwork = (req, res, next) => {
    const { network } = req.params

    if (isApiConnected(apis[network])) {
      next()
    } else {
      res.status(404).send('Network is not connected!')
    }
  }

  router.get(
    '/check/:network',
    asyncErrorHandler(async (req, res) => {
      const { network } = req.params

      const isNetworkConnected = isApiConnected(apis[network])

      res.send(isNetworkConnected || false)
    })
  )

  router.get(
    '/:account/balances/:network',
    checkAccount,
    checkNetwork,
    asyncErrorHandler(async (req, res) => {
      const { account, network } = req.params
      const balance = await getBalanceByAccount(apis[network], account, network)
      res.send(balance)
    })
  )

  router.get(
    '/identities',
    asyncErrorHandler(async (req, res) => {
      const { accounts } = req.query
      const identities = await getIdentities({ accounts: accounts as string[], apis })
      res.send(identities)
    })
  )

  router.get(
    '/:account/nfts',
    checkAccount,
    asyncErrorHandler(async (req, res) => {
      const { account } = req.params
      const contributions = await getNftsByAccount({ apis, account })
      res.send(contributions)
    })
  )

  router.get(
    '/:account/domains',
    checkAccount,
    asyncErrorHandler(async (req, res) => {
      const { account } = req.params
      const domains = await getDomainsByAccount({ apis, account })
      res.send(domains)
    })
  )

  router.get(
    '/:account/domains/:spaceId',
    checkAccount,
    asyncErrorHandler(async (req, res) => {
      const { spaceId, account } = req.params
      const domainStruct = await getDomainByAccountAndSpaceId({ apis, spaceId, account })
      res.send(domainStruct)
    })
  )

  router.get(
    '/prices',
    asyncErrorHandler(async (req, res) => {
      const prices = await getPrices(req.query.ids)
      res.send(prices)
    })
  )

  router.use('/chains', asyncErrorHandler(createChainsRouter(apis)))
  router.use('/statemine/assets', asyncErrorHandler(createStatemineAssetsRouter(apis)))
  router.use('/crowdloans', asyncErrorHandler(createCrowdloansRouter(apis)))
  router.use('/domains', asyncErrorHandler(createDomainsRouter(apis)))
  router.use('/health', asyncErrorHandler(createHealthRouter(apis)))
  router.use('/accounts', asyncErrorHandler(createInterestingAccountsRouter(apis)))
  router.use('/staking/collator', asyncErrorHandler(createCollatorStakingRouter(apis)))
  router.use('/staking/validator', asyncErrorHandler(createValidatorStakingRouter(apis)))
  router.use('/fees', asyncErrorHandler(createFeesRouter(apis)))

  return router
}

