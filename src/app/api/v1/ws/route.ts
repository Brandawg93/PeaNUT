import * as net from 'net'

interface NutConfig {
  host: string
  port: number
}

export function SOCKET(client: import('ws').WebSocket, request: import('http').IncomingMessage) {
  console.log('A client connected')

  // Parse the URL to get NUT server details
  const url = new URL(request.url || '', `http://${request.headers.host}`)
  const nutHost = url.searchParams.get('nutHost')
  const nutPort = url.searchParams.get('nutPort')

  const nutConfig: NutConfig = {
    host: nutHost || process.env.NUT_HOST || 'localhost',
    port: parseInt(nutPort || process.env.NUT_PORT || '3493'),
  }

  // Add message buffer
  let messageBuffer = ''

  // Create connection to NUT server
  const nutClient = new net.Socket()

  nutClient.connect(nutConfig.port, nutConfig.host, () => {
    console.log('Connected to NUT server')
  })

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
      const command = message.toString()

      // Append the new message to the buffer
      messageBuffer += command

      // Check if the message contains a newline
      if (messageBuffer.includes('\r')) {
        nutClient.write(messageBuffer.replace('\r', '\n'))
        client.send('\r\n')
        messageBuffer = ''
      }
    } catch (error) {
      console.error('Error sending message to NUT server:', error)
      client.send(JSON.stringify({ type: 'error', message: 'Failed to send message to NUT server' }))
    }
  })

  client.on('close', () => {
    console.log('A client disconnected')
    // Clean up NUT connection when WebSocket closes
    nutClient.end()
  })

  nutClient.on('close', () => {
    console.log('NUT server connection closed')
    client.close()
  })
}
