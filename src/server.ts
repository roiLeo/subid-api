import express from 'express'
import cors from 'cors'
import timeout from 'connect-timeout'
import { reqTimeoutSecs, allowedOrigins, port } from './constant/env'
import { newLogger } from '@subsocial/utils'

import { createRoutes } from './routes'
import { Connections } from './connections'

require('dotenv').config()

const log = newLogger('HTTP server')

export const startHttpServer = (apis: Connections) => {
  const app = express()

  app.use(express.static('public'))

  app.use(
    cors((req, callback) => {
      const corsOptions = { origin: true }
      const origin = req.header('Origin')
      const isAllowedOrigin = allowedOrigins.some((allowedOrigin) => origin?.includes(allowedOrigin))
      if (!isAllowedOrigin) {
        corsOptions.origin = false
      }
      callback(null, corsOptions)
    })
  )

  function haltOnTimedout(req: express.Request, _res: express.Response, next) {
    if (!req.timedout) next()
  }

  app.use(timeout(`${reqTimeoutSecs}s`))

  // for parsing application/json
  app.use(express.json())
  app.use(haltOnTimedout)

  // for parsing application/xwww-form-urlencoded
  app.use(express.urlencoded({ extended: true }))
  app.use(haltOnTimedout)

  app.use('/api/v1', createRoutes(apis))

  app.use(function (err, _req, res, _next) {
    log.error(JSON.stringify(err.stack))
    res.status(500).send(err.stack)
  })

  // for parsing multipart/form-data
  // const upload = multer({ limits: { fieldSize: maxFileSizeBytes } })
  // app.use(express.static('./email/templates'))
  app.listen(port, () => {
    log.info(`HTTP server started on port ${port}`)
  })
}
