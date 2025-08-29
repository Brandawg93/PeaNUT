import * as net from 'net'
import { getToken } from 'next-auth/jwt'

interface NutConfig {
  host: string
  port: number
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

  // Add message buffer
  let messageBuffer = ''

  // Create connection to NUT server
  const nutClient = new net.Socket()

  nutClient.connect(nutConfig.port, nutConfig.host)

  nutClient.on('data', (data) => {
    // Forward NUT server responses to WebSocket client
    client.send(data.toString().replace(/\n/g, '\r\n'))
  })

  nutClient.on('error', (error) => {
    console.error('NUT server error:', error)
    client.send(JSON.stringify({ type: 'error', message: 'NUT server error' }))
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
          client.send('\x1b[2J\x1b[H')
          messageBuffer = ''
          return
        }
        nutClient.write(messageBuffer.replace(/\r/g, '\n'))
        client.send('\r\n')
        messageBuffer = ''
      }
    } catch (error) {
      console.error('Error sending message to NUT server:', error)
      client.send(JSON.stringify({ type: 'error', message: 'Failed to send message to NUT server' }))
    }
  })

  client.on('close', () => {
    // Clean up NUT connection when WebSocket closes
    nutClient.end()
  })

  nutClient.on('close', () => {
    client.close()
  })
}
