import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'

if (!dev) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { config } = require('../.next/required-server-files.json')
  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(config)
}

const port = parseInt(process.env.PORT || '3000', 10)
const app = next({ dev })
const handle = app.getRequestHandler()

process.on('SIGINT', function () {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)')
  process.exit(0)
})

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(port)

  console.log(`> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`)
})
