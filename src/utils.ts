export const asTypesGenerator =
  <Value>() =>
  <Keys>(et: { [K in keyof Keys]: Value }) =>
    et

export function decodeMethodString (method: string) {
  const groupingRegex = /(.+)\((.*)\)/
  const groups = method.match(groupingRegex)
  
  let extrinsicMethod: string[] | null = null
  let params: string[] | null = null

  if (groups) {
    extrinsicMethod = groups[1]?.split('.') || null
    params = groups[2]?.split(',') || null
  }

  return {
    method: extrinsicMethod,
    params
  }
}

export const startWithUpperCase = (str?: string) => str?.replace(/(?:^\s*|\s+)(\S?)/g, (b) => b.toUpperCase()) || ''

export function callMethodString <T, V = Record<string, any>> (methodString: string, apiToChainCall: T, paramsData: V) {
  const { method, params } = decodeMethodString(methodString)
  if (!method || !params) return undefined

  try {
    let currentApi = apiToChainCall
    const [ palletName, storageName ] = method
    let functionToBeCalled = currentApi?.[palletName]?.[storageName]
    if (typeof functionToBeCalled !== 'function') throw new Error('Method is not available')
    const usedParams = []
    params.forEach((paramName) => {
      usedParams.push(paramsData[paramName])
    })
    return functionToBeCalled(...usedParams)
  } catch (e) {
    console.warn(`${methodString} cannot be called with ${JSON.stringify(paramsData)}`, e)
  }
}
