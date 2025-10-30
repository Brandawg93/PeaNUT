'use client'

import React, { useEffect, useRef } from 'react'
import { FitAddon } from '@xterm/addon-fit'
import { AttachAddon } from '@xterm/addon-attach'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useTheme } from 'next-themes'
import { useBasePath } from '@/hooks/useBasePath'

type Props = Readonly<{
  host: string
  port: number
}>

export default function NutTerminal({ host, port }: Props) {
  const wsRef = useRef<WebSocket | null>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const basePath = useBasePath()

  useEffect(() => {
    if (!containerRef.current || wsRef.current || terminalRef.current) return

    // Define handleCommand inside effect to avoid accessing before declaration
    const handleCommand = async (data: string) => {
      const terminal = terminalRef.current
      if (!terminal) return

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

    // Initialize terminal
    const terminal = new Terminal({
      theme: {
        background: resolvedTheme === 'dark' ? '#09090b' : '#fafafa',
        cursor: resolvedTheme === 'dark' ? '#fafafa' : '#09090b',
        foreground: resolvedTheme === 'dark' ? '#fafafa' : '#09090b',
        selectionBackground: resolvedTheme === 'dark' ? '#3e3e3e' : '#dcdcdc',
      },
    })
    terminalRef.current = terminal
    terminal.open(containerRef.current)

    const ws = new WebSocket(
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${basePath}/api/ws?nutHost=${encodeURIComponent(host)}&nutPort=${encodeURIComponent(port)}`
    )
    wsRef.current = ws

    // Define handleResize outside onopen so it's accessible in cleanup
    const fitAddon = new FitAddon()
    const handleResize = () => fitAddon.fit()

    ws.onopen = () => {
      const attachAddon = new AttachAddon(ws)

      terminal.loadAddon(fitAddon)
      terminal.loadAddon(attachAddon)

      // Handle terminal input
      terminal.onData((data: string) => {
        handleCommand(data)
      })

      // Handle resize event
      window.addEventListener('resize', handleResize)
      // Initial fit
      fitAddon.fit()
    }

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      wsRef.current = null
      if (terminalRef.current) {
        terminalRef.current.dispose()
        terminalRef.current = null
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [host, port, resolvedTheme, basePath])

  return (
    <div className='h-full w-full'>
      <div ref={containerRef} className='h-full w-full' />
    </div>
  )
}
