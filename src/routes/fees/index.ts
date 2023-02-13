import { Router } from 'express'

import { Apis } from '../../connections/networks/types'
import { GetTransferFeeParam, getTransferFee } from '../../services/fees/transfer'

const createFeesRouter = (apis: Apis) => {
  const router = Router()

  router.get('/transfer', async function (req, res) {
    const fee = await getTransferFee(apis, req.query as GetTransferFeeParam)
    res.send(fee)
  })

  return router
}

export default createFeesRouter
