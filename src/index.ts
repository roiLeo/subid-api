import { createConnections } from './connections'
import { startHttpServer } from './server'

const start = async () => {
  const apis = await createConnections()
  startHttpServer(apis)
}

start()