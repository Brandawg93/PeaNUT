import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from '@/client/context/theme'
import { LanguageContext } from '@/client/context/language'
import { Button, Input } from '@material-tailwind/react'

type AddServerProps = {
  server: string
  port: number
  setServer: (server: string) => void
  setPort: (port: number) => void
  handleSubmit: (e: any) => void
}

export default function AddServer({ server, port, setServer, setPort, handleSubmit }: AddServerProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useContext(ThemeContext)

  return (
    <form className='w-full rounded-lg p-6 dark:bg-gray-600' onSubmit={handleSubmit}>
      <div className='mb-4'>
        <Input
          type='text'
          variant='outlined'
          label={t('connect.server')}
          value={server}
          onChange={(e) => setServer(e.target.value)}
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
          onChange={(e) => setPort(+e.target.value)}
          className='w-full px-3 py-2'
          color={theme === 'light' ? 'black' : 'white'}
          data-testid='port'
          min={0}
          max={65535}
          crossOrigin=''
        />
      </div>
      <div className='flex flex-row justify-between'>
        <Button className='bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700' type='button'>
          Cancel
        </Button>
        <Button type='submit'>{t('connect.connect')}</Button>
      </div>
    </form>
  )
}
