import { Router } from 'express'
import { Apis } from '../../connections/networks/types'
import { getRegisteredDomains, isReservedWord } from '../../services/domains'
import { parseDomain } from '@subsocial/utils'

const buildLink = (url) => `https://${url}`

const createDomainsRouter = (apis: Apis) => {
  const router = Router()

  router.get('/:domain', async function (req, res) {
    const { domain } = req.params
    const domainStruct = await getRegisteredDomains({ apis, domain })
    res.send(domainStruct)
  })

  router.get('/to/:domain', async function (req, res) {
    const domainFromReq = req.params.domain
    const { domain: domainName, tld = 'sub' } = parseDomain(domainFromReq)
    const domain = `${domainName}.${tld}`
    const domainStruct = await getRegisteredDomains({ apis, domain })
    const outerValue = domainStruct?.outerValue

    let location = `https://app.subsocial.network/dd/register?domain=${domainFromReq}`

    if (domainStruct) {
      if (outerValue && outerValue.startsWith('http')) {
        location = outerValue
      } else {
        location = buildLink(`sub.id/${domainFromReq}`)
      }
    }

    res.writeHead(301, { Location: location })
    res.end()
  })

  router.get('/reserved/:word', async function (req, res) {
    const { word } = req.params
    const isReserved = await isReservedWord({ apis, word })
    res.send(isReserved)
  })

  return router
}

export default createDomainsRouter
