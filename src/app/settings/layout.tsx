'use client'

import React, { useContext } from 'react'
import NavBar from '@/client/components/navbar'
import DayNightSwitch from '@/client/components/daynight'
import LanguageSwitcher from '@/client/components/language-switcher'
import { LanguageContext } from '@/client/context/language'
import { Button } from '@/client/components/ui/button'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { TbSettings } from 'react-icons/tb'
import { logout } from '@/app/actions'
import { LuLogOut } from 'react-icons/lu'

export default function SettingsLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()

  return (
    <div className='bg-background flex h-full min-h-screen flex-col' data-testid='wrapper'>
      <NavBar>
        <div className='flex justify-end space-x-2'>
          <DayNightSwitch />
          <LanguageSwitcher />
          <Button variant='ghost' size='icon' title={t('logout')} aria-label={t('logout')} onClick={logout}>
            <LuLogOut className='size-6! stroke-[1.5px]' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            title={t('sidebar.settings')}
            aria-label={t('sidebar.settings')}
            onClick={() => router.push('/settings')}
          >
            <TbSettings className='size-6! stroke-[1.5px]' />
          </Button>
        </div>
      </NavBar>
      {children}
    </div>
  )
}
