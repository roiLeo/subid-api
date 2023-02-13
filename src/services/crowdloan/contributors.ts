import polkadotContributors from './data/polkadot-contributions.json'
import kusamaContributors from './data/kusama-contributions.json'
import BN from 'bignumber.js'
import fs from 'fs'
import { toGenericAccountId } from '../utils'
import { RelayChain } from './types'
import { newLogger } from '@subsocial/utils'

const log = newLogger('Contributions')

const contributors = {
  polkadot: polkadotContributors,
  kusama: kusamaContributors
}
const EXPORT_DIRECTORY_NAME = 'contributions'
const EXPORT_DIRECTORY_PATH = `./public/${EXPORT_DIRECTORY_NAME}`

type GetContributorsSortedProps = {
  relayChain: RelayChain
}

const getContributorsSorted = async ({ relayChain }: GetContributorsSortedProps) => {
  const contributorsGenericIdMap = new Map()
  const addresses = new Set()

  log.info(`started reading crowdloans for ${relayChain}...`)

  const chainContributors = contributors[relayChain]

  chainContributors['data']['crowdloans'].forEach((crowdloan) => {
    crowdloan.contributors.forEach((contributor) => {
      const genericId = toGenericAccountId(contributor.id)
      let maybeAmount = contributorsGenericIdMap[genericId]
      let amount = new BN(contributor.amount)

      if (maybeAmount) {
        amount = amount.plus(maybeAmount)
      }
      addresses.add(genericId)
      contributorsGenericIdMap[genericId] = amount
    })
  })
  if (!fs.existsSync(EXPORT_DIRECTORY_PATH)) {
    fs.mkdirSync(EXPORT_DIRECTORY_PATH)
  }

  const contributorsMapArray = []

  addresses.forEach((address: string) => {
    contributorsMapArray.push([address, contributorsGenericIdMap[address]])
  })
  const contributorsSortedByValue = contributorsMapArray
    .sort((a, b) => (b[1] as BN).minus(a[1] as BN).toNumber())
    .reduce((map, obj) => {
      map[obj[0]] = obj[1].toString()
      return map
    }, {})

  log.info(`writing to ${relayChain}-contributions.json file`)
  fs.writeFileSync(
    `${EXPORT_DIRECTORY_PATH}/${relayChain}-contributors.json`,
    JSON.stringify(contributorsSortedByValue, null, 2)
  )
}

getContributorsSorted({ relayChain: 'polkadot' })
getContributorsSorted({ relayChain: 'kusama' })
