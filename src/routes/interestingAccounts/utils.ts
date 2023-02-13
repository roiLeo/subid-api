import { nonEmptyStr, parseNumStr } from '@subsocial/utils'
import { Request, Response } from 'express'

const MAX_RESULTS_LIMIT = 20
export type RequestProps = {
  req: Request
  value: 'limit' | 'offset'
  def: number
}
export type RequestDataProps = {
  req: Request
  value: 'limit' | 'offset'
  def: Object
}

const getNumberFromRequest = ({ req, value, def }: RequestProps): number => {
  const reqParameter = req.query[value]
  return nonEmptyStr(reqParameter) ? parseNumStr(reqParameter) : def
}

const getFromRequest = ({ req, value, def }: RequestDataProps): Object => {
  const reqParameter = req.query[value]
  return nonEmptyStr(reqParameter) ? reqParameter : def
}

export const getLimitFromRequest = (req: Request): number => {
  const limit = getNumberFromRequest({ req, value: 'limit', def: MAX_RESULTS_LIMIT })
  return limit < MAX_RESULTS_LIMIT ? limit : MAX_RESULTS_LIMIT
}

export const getOffsetMapFromRequest = (req: Request, defaultOffset?: {}): Object => {
  return JSON.parse(getFromRequest({ req, value: 'offset', def: defaultOffset }).toString())
}

export const getOffsetFromRequest = (req: Request, defaultOffset?: number): number => {
  return getNumberFromRequest({ req, value: 'offset', def: defaultOffset })
}

export const checkAndSendData = (data: any, res: Response) => {
  if (!data) {
    res.status(404).send('Invalid type provided')
  }

  res.json(data)
}
