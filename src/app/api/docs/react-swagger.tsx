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

type Props = {
  spec: Record<string, any>
}

function ReactSwagger({ spec }: Props) {
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
            size='lg'
            className='px-3'
            title={t('sidebar.settings')}
            aria-label={t('sidebar.settings')}
            onClick={() => router.push('/settings')}
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
