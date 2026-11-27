import http from 'node:http'
import https from 'node:https'

const isHttps = process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH
const client = isHttps ? https : http

const port = Number.parseInt(process.env.WEB_PORT || process.env.PORT || '8080', 10)

// Use 127.0.0.1 for local healthcheck as it's more reliable than 0.0.0.0 inside containers
// Internal routes do not use the BASE_PATH prefix in the standalone server
const options = {
  host: '127.0.0.1',
  port,
  path: '/api/ping',
  timeout: 5000,
  rejectUnauthorized: false, // Allow self-signed or internal certs for healthcheck
}

const request = client.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.stderr.write(`Healthcheck failed: status code ${res.statusCode}\n`)
    process.exit(1)
  }
})

request.on('error', (err) => {
  process.stderr.write(`Healthcheck failed: ${err.message}\n`)
  process.exit(1)
})

request.on('timeout', () => {
  process.stderr.write('Healthcheck failed: timeout\n')
  request.destroy()
  process.exit(1)
})

request.end()
