import * as net from 'net'
import { getToken } from 'next-auth/jwt'
import { getSettings } from '@/app/actions'
import { server } from '@/common/types'

interface NutConfig {
  host: string
  port: number
}

// Validate that the host and port are present in the configured allow-list
async function isAllowedNutServer(host: string, port: number): Promise<boolean> {
  const servers = await getSettings('NUT_SERVERS')
  if (!servers || !Array.isArray(servers)) return false
  return servers.some(
    (s: server) =>
      String(s.HOST).trim().toLowerCase() === String(host).trim().toLowerCase() &&
      Number(s.PORT) === Number(port) &&
      !s.DISABLED
  )
}

export function GET() {
  const headers = new Headers()
  headers.set('Connection', 'Upgrade')
  headers.set('Upgrade', 'websocket')
  return new Response('Upgrade Required', { status: 426, headers })
}

export async function UPGRADE(
  client: import('ws').WebSocket,
  _server: import('ws').WebSocketServer,
  request: import('next/server').NextRequest
) {
  if (process.env.WEB_USERNAME && process.env.WEB_PASSWORD) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    })

    if (!token) {
      console.error('Unauthorized WebSocket connection attempt')
      client.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }))
      client.close()
      return
    }
  }

  // Parse the URL to get NUT server details
  const url = request.nextUrl ?? new URL(request.url)
  const nutHost = url.searchParams.get('nutHost')
  const nutPort = url.searchParams.get('nutPort')

  const nutConfig: NutConfig = {
    host: nutHost ?? process.env.NUT_HOST ?? 'localhost',
    port: parseInt(nutPort ?? process.env.NUT_PORT ?? '3493'),
  }

  // Validate that the connection is to an allowed server (SSRF protection)
  const isAllowed = await isAllowedNutServer(nutConfig.host, nutConfig.port)
  if (!isAllowed) {
    console.error('Attempted connection to non-allowed server:', nutConfig)
    client.send(JSON.stringify({ type: 'error', message: 'Connection to this server is not allowed' }))
    client.close()
    return
  }

  // Add message buffer
  let messageBuffer = ''
  let isClosing = false

  // Create connection to NUT server
  const nutClient = new net.Socket()

  nutClient.connect(nutConfig.port, nutConfig.host)

  nutClient.on('data', (data) => {
    try {
      // Forward NUT server responses to WebSocket client
      if (!isClosing && client.readyState === 1) {
        client.send(data.toString().replace(/\n/g, '\r\n'))
      }
    } catch (error) {
      // Silently handle errors when connection is closing
      if (!isClosing) {
        console.error('Error forwarding data to client:', error)
      }
    }
  })

  nutClient.on('error', (error) => {
    if (!isClosing) {
      console.error('NUT server error:', error)
      try {
        if (client.readyState === 1) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          client.send(JSON.stringify({ type: 'error', message: `NUT server error: ${errorMessage}` }))
        }
      } catch {
        // Ignore errors when sending to closed connection
      }
    }
  })

  client.on('message', (message) => {
    try {
      // Handle backspace character (0x7F)
      if (Buffer.isBuffer(message) && message.length === 1 && message[0] === 0x7f) {
        if (messageBuffer.length > 0) {
          messageBuffer = messageBuffer.slice(0, -1)
        }
        return
      }

      // Append the new message to the buffer
      messageBuffer += message

      // Check if the message contains a newline
      if (messageBuffer.includes('\r')) {
        if (messageBuffer === 'clear\r') {
          if (client.readyState === 1) {
            client.send('\x1b[2J\x1b[H')
          }
          messageBuffer = ''
          return
        }
        if (!nutClient.destroyed) {
          nutClient.write(messageBuffer.replace(/\r/g, '\n'))
        }
        if (client.readyState === 1) {
          client.send('\r\n')
        }
        messageBuffer = ''
      }
    } catch (error) {
      if (!isClosing) {
        console.error('Error sending message to NUT server:', error)
        try {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'error', message: 'Failed to send message to NUT server' }))
          }
        } catch {
          // Ignore errors when sending to closed connection
        }
      }
    }
  })

  client.on('close', () => {
    // Clean up NUT connection when WebSocket closes
    isClosing = true
    if (!nutClient.destroyed) {
      nutClient.destroy()
    }
  })

  client.on('error', (error) => {
    // Handle WebSocket errors gracefully
    if (!isClosing) {
      console.error('WebSocket client error:', error)
    }
  })

  nutClient.on('close', () => {
    isClosing = true
    try {
      if (client.readyState === 1) {
        client.close()
      }
    } catch {
      // Ignore errors when closing already-closed connection
    }
  })
}
