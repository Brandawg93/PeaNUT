'use client'

import React, { useEffect, useRef } from 'react'
import { useXTerm } from 'react-xtermjs'
import { FitAddon } from '@xterm/addon-fit'
import { AttachAddon } from '@xterm/addon-attach'
import { Terminal } from '@xterm/xterm'

type Props = {
  host: string
  port: number
}

export default function NutTerminal({ host, port }: Props) {
  const { instance, ref } = useXTerm()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!instance || wsRef.current) return // Prevent multiple WS connections

    const ws = new WebSocket(
      `ws://${window.location.host}/api/v1/ws?nutHost=${encodeURIComponent(host)}&nutPort=${encodeURIComponent(port)}`
    )
    wsRef.current = ws

    // Define handleResize outside onopen so it's accessible in cleanup
    const fitAddon = new FitAddon()
    const handleResize = () => fitAddon.fit()

    ws.onopen = () => {
      const attachAddon = new AttachAddon(ws)

      instance.loadAddon(fitAddon)
      instance.loadAddon(attachAddon)

      // Handle terminal input
      instance.onData((data) => {
        handleCommand(data, instance)
      })

      // Handle resize event
      window.addEventListener('resize', handleResize)
      // Initial fit
      fitAddon.fit()
    }

    ws.onclose = () => {
      console.log('Disconnected from the server')
    }

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      wsRef.current = null
      window.removeEventListener('resize', handleResize)
    }
  }, [ref, instance, host, port])

  const handleCommand = async (data: string, terminal: Terminal) => {
    try {
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
