import { ApiPromise, GetApiFn } from './types'
import { options } from '@bifrost-finance/api'

export const getBitfrostApi: GetApiFn = ({ provider }) => new ApiPromise(options({ provider }))