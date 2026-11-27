#!/usr/bin/env node

import http from 'node:http'
import https from 'node:https'
import fs from 'node:fs'

// Set environment variables with defaults
process.env.HOSTNAME = process.env.WEB_HOST || '0.0.0.0'
process.env.PORT = process.env.WEB_PORT || '8080'
process.env.NEXT_PUBLIC_BASE_PATH = process.env.BASE_PATH || ''

const certPath = process.env.SSL_CERT_PATH
const keyPath = process.env.SSL_KEY_PATH

if (certPath && keyPath) {
  try {
    const options = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    }

    http.createServer = (...args) => {
      const [arg1, arg2] = args
      if (typeof arg1 === 'function') {
        return https.createServer(options, arg1)
      }
      return https.createServer({ ...options, ...arg1 }, arg2)
    }

    console.log(`SSL enabled with certificate: ${certPath}`)
  } catch (error) {
    console.error('Failed to load SSL certificates:', error.message)
    process.exit(1)
  }
}

// Execute the Node.js server
await import('./server.js')
