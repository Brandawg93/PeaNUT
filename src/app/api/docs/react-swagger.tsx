'use client'

import DayNightSwitch from '@/client/components/daynight'
import LanguageSwitcher from '@/client/components/language-switcher'
import NavBar from '@/client/components/navbar'
import { Button } from '@/client/components/ui/button'
import { t } from 'i18next'
import { useRouter } from 'next/navigation'
import React from 'react'
import { TbSettings } from 'react-icons/tb'
import { useTheme } from 'next-themes'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import './custom.css'
import { LuLogOut } from 'react-icons/lu'

type Props = Readonly<{
  spec: Record<string, any>
  onLogout: () => void
}>

function ReactSwagger({ spec, onLogout }: Props) {
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const swaggerTheme = resolvedTheme === 'dark' ? 'invert-[0.98] hue-rotate-180' : 'invert-0 hue-rotate-0'
  return (
    <>
      <NavBar>
        <div className='flex justify-end space-x-2'>
          <DayNightSwitch />
          <LanguageSwitcher />
          <Button
            variant='ghost'
            size='icon'
            title={t('logout')}
            aria-label={t('logout')}
            onClick={onLogout}
            className='cursor-pointer'
          >
            <LuLogOut className='size-6! stroke-[1.5px]' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            title={t('sidebar.settings')}
            aria-label={t('sidebar.settings')}
            onClick={() => router.push('/settings')}
            className='cursor-pointer'
          >
            <TbSettings className='size-6! stroke-[1.5px]' />
          </Button>
        </div>
      </NavBar>
      <div className={`container mx-auto mt-4 ${swaggerTheme}`}>
        <SwaggerUI spec={spec} />
      </div>
    </>
  )
}

export default ReactSwagger
