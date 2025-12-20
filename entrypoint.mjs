#!/usr/bin/env node

// Set environment variables with defaults
process.env.HOSTNAME = process.env.WEB_HOST || '0.0.0.0'
process.env.PORT = process.env.WEB_PORT || '8080'
process.env.NEXT_PUBLIC_BASE_PATH = process.env.BASE_PATH || ''

// Execute the Node.js server
await import('./server.js')
