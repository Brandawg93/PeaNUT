import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import { ThemeContext } from '@/client/context/theme'
import { LanguageContext } from '@/client/context/language'
import { Button, Input } from '@material-tailwind/react'

type AddInfluxProps = {
  initialServer: string
  initialPort: number
  handleChange: (server: string, port: number) => void
  testConnectionAction: (server: string, port: number) => Promise<string>
}

export default function AddInflux({ initialServer, initialPort, handleChange, testConnectionAction }: AddInfluxProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useContext(ThemeContext)
  const [server, setServer] = useState<string>(initialServer)
  const [port, setPort] = useState<number>(initialPort)
  const [connecting, setConnecting] = useState<boolean>(false)

  const handleTestConnection = async () => {
    if (server && port) {
      setConnecting(true)
      const promise = testConnectionAction(server, port)
      toast.promise(promise, {
        pending: t('connect.testing'),
        success: {
          render() {
            setConnecting(false)
            return t('connect.success')
          },
        },
        error: {
          render() {
            setConnecting(false)
            return t('connect.error')
          },
        },
      })
    }
  }

  return (
    <div className='mb-4 w-full rounded-lg bg-gray-200 pb-6 pl-6 dark:bg-gray-600'>
      <ToastContainer position='top-center' theme={theme} />
      <div className='pr-6 pt-6'>
        <form className='w-full'>
          <div className='mb-4'>
            <Input
              type='text'
              variant='outlined'
              label={t('connect.server')}
              value={server}
              onChange={(e) => {
                setServer(e.target.value)
                handleChange(e.target.value, port)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='server'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              type='number'
              variant='outlined'
              label={t('connect.port')}
              value={port}
              onChange={(e) => {
                setPort(+e.target.value)
                handleChange(server, +e.target.value)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='port'
              min={0}
              max={65535}
              crossOrigin=''
            />
          </div>
          <div className='flex flex-row justify-between'>
            <div />
            <Button
              disabled={connecting}
              onClick={handleTestConnection}
              className='bg-red-500 font-bold text-white shadow-none hover:bg-red-700'
              type='button'
            >
              {t('connect.test')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
