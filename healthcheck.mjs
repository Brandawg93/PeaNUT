import http from 'http'

// Use 127.0.0.1 for local healthcheck as it's more reliable than 0.0.0.0 inside containers
const options = {
  host: '127.0.0.1',
  port: parseInt(process.env.WEB_PORT || '8080', 10),
  path: (process.env.BASE_PATH || '') + '/api/ping',
  timeout: 5000,
}

const request = http.request(options, (res) => {
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
