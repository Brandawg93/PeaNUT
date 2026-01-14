import http from 'node:http'
import https from 'node:https'

const isHttps = process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH
const client = isHttps ? https : http

// Use 127.0.0.1 for local healthcheck as it's more reliable than 0.0.0.0 inside containers
const options = {
  host: '127.0.0.1',
  port: Number.parseInt(process.env.WEB_PORT || '8080', 10),
  path: (process.env.BASE_PATH || '') + '/api/ping',
  timeout: 5000,
  rejectUnauthorized: false, // Allow self-signed or internal certs for healthcheck
}

const request = client.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.exit(1)
  }
})

request.on('error', () => {
  process.exit(1)
})

request.on('timeout', () => {
  request.destroy()
  process.exit(1)
})

request.end()
