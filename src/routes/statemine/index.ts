import { Router } from 'express'

import { Apis } from '../../connections/networks/types'
import { getStatemineAssetBalancesByAccount, getStatemineAssets } from '../../services/assets';
import { checkAccount } from '../utils';

const createStatemineAssetsRouter = (apis: Apis) => {
  const router = Router()

  router.get('/', async function (_req, res) {
    const assets = await getStatemineAssets(apis.statemine)
    res.send(assets);
  });

  router.get('/:account',
    checkAccount,
    async function (req, res) {
      const { account } = req.params
      const balances = await getStatemineAssetBalancesByAccount(apis.statemine, account)
      res.send(balances);
    });

  return router
}

export default createStatemineAssetsRouter