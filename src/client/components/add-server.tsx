import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ThemeContext } from '@/client/context/theme'
import { LanguageContext } from '@/client/context/language'
import { Button, IconButton, Input } from '@material-tailwind/react'

type AddServerProps = {
  server: string
  port: number
  setServer: (server: string) => void
  setPort: (port: number) => void
  handleSubmit: (e: any) => void
  handleRemove: () => void
  removable?: boolean
}

export default function AddServer({
  server,
  port,
  setServer,
  setPort,
  handleSubmit,
  handleRemove,
  removable,
}: AddServerProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useContext(ThemeContext)

  return (
    <div className='mb-4 w-full rounded-lg bg-gray-200 pb-6 pl-6 dark:bg-gray-600'>
      {removable ? (
        <div className='h-12'>
          <IconButton
            variant='text'
            className='text-md float-right px-3 text-black shadow-none dark:text-white'
            title={t('settings.remove')}
            onClick={handleRemove}
          >
            <XMarkIcon className='h-6 w-6 stroke-1 dark:text-white' />
          </IconButton>
        </div>
      ) : (
        <div className='pt-6' />
      )}
      <div className='pr-6'>
        <form className='w-full' onSubmit={handleSubmit}>
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
            <div />
            <Button className='bg-red-500 font-bold text-white shadow-none hover:bg-red-700' type='button'>
              {t('connect.test')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
