'use client'

import React, { useEffect } from 'react'
import { useXTerm } from 'react-xtermjs'
import { FitAddon } from '@xterm/addon-fit'
import { AttachAddon } from '@xterm/addon-attach'
import { Terminal } from '@xterm/xterm'

type Props = {
  host: string
  port: number
  username?: string
  password?: string
}

export default function NutTerminal({ host, port }: Props) {
  const ws = new WebSocket(
    `ws://${window.location.host}/api/v1/ws?nutHost=${encodeURIComponent(host)}&nutPort=${encodeURIComponent(port)}`
  )

  ws.onopen = () => {
    console.log('Connected to the server')
  }

  const { instance, ref } = useXTerm()
  const fitAddon = new FitAddon()
  const attachAddon = new AttachAddon(ws)

  useEffect(() => {
    // Load the fit addons
    instance?.loadAddon(fitAddon)
    instance?.loadAddon(attachAddon)

    // Write custom message on your terminal
    instance?.writeln('Welcome react-xtermjs!')
    instance?.writeln('This is a simple example using an addon.')

    // Handle terminal input
    instance?.onData((data) => {
      handleCommand(data, instance)
    })

    // Handle resize event
    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [ref, instance])

  const handleCommand = async (data: string, terminal: Terminal) => {
    try {
      // Ignore arrow keys (they come as escape sequences)
      if (data.startsWith('\x1b[')) {
        return
      }

      if (data === 'clear') {
        terminal.clear()
        return
      }

      if (data === '\u007F') {
        terminal.write('\b \b')
        return
      }

      if (data) {
        terminal.write(data)
      }
    } catch (error) {
      console.error('Error in handleCommand:', error)
      terminal.writeln('\r\nError executing command')
    }
  }

  return (
    <div className='h-full w-full'>
      <div ref={ref} className='h-full w-full' />
    </div>
  )
}
