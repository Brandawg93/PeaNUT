'use client'

import React, { useContext } from 'react'
import NavBar from '@/client/components/navbar'
import DayNightSwitch from '@/client/components/daynight'
import LanguageSwitcher from '@/client/components/language-switcher'
import { LanguageContext } from '@/client/context/language'
import { Button } from '@/client/components/ui/button'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'

export default function SettingsLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()

  return (
    <div className='flex h-full min-h-screen flex-col bg-background' data-testid='wrapper'>
      <NavBar>
        <div className='hidden sm:block'>
          <DayNightSwitch />
        </div>
        &nbsp;
        <div className='hidden sm:block'>
          <LanguageSwitcher />
        </div>
        &nbsp;
        <div>
          <Button
            variant='ghost'
            size='lg'
            className='px-3'
            title={t('sidebar.settings')}
            aria-label={t('sidebar.settings')}
            onClick={() => router.push('/settings')}
          >
            <HiOutlineCog6Tooth className='!h-6 !w-6 text-black dark:text-white' />
          </Button>
        </div>
      </NavBar>
      {children}
    </div>
  )
}
