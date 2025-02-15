import React, { useEffect } from 'react'
import { useXTerm } from 'react-xtermjs'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'

type Props = {
  host: string
  port: number
  username?: string
  password?: string
  nutCommandAction: (
    host: string,
    port: number,
    command: string,
    username?: string,
    password?: string
  ) => Promise<string>
}

export default function NutTerminal({ nutCommandAction, host, port, username, password }: Props) {
  const { instance, ref } = useXTerm({ options: { cursorBlink: true } })
  const fitAddon = React.useRef(new FitAddon())
  const commandBuffer = React.useRef('')

  useEffect(() => {
    if (!instance) return

    // Initialize terminal
    instance.loadAddon(fitAddon.current)
    instance.writeln('NUT Server Terminal')
    instance.writeln('Type your commands below...')

    // Handle terminal input
    instance.onData((data) => {
      handleCommand(data, instance)
    })

    // Handle window resizing
    const handleResize = () => fitAddon.current.fit()
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [instance])

  const handleCommand = async (data: string, terminal: Terminal) => {
    try {
      if (commandBuffer.current.trim() === 'clear') {
        terminal.clear()
        commandBuffer.current = ''
        return
      }

      if (data === '\r') {
        if (commandBuffer.current) {
          const response = await nutCommandAction(host, port, commandBuffer.current, username, password)
          terminal.write('\r\n')
          response.split('\n').forEach((line) => {
            terminal.writeln(`${line.trim()}`)
          })
          commandBuffer.current = ''
        }
        return
      }

      if (data) {
        commandBuffer.current += data
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
