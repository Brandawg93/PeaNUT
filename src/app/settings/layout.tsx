'use client'

import React, { useContext } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'
import Image from 'next/image'
import logo from '@/app/icon.svg'
import LanguageSwitcher from '@/client/components/language-switcher'
import { LanguageContext } from '@/client/context/language'
import { useTranslation } from 'react-i18next'
import DayNightSwitch from '@/client/components/daynight'
import { Button } from '@/client/components/ui/button'

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
      <div className='flex justify-center'>
        <div className='container mt-2'>
          <div className='border-border bg-card sticky top-0 z-10 mb-4 h-max max-w-full rounded-lg border px-4 py-2 lg:px-8 lg:py-4'>
            <div className='flex items-center justify-between'>
              <Link
                href='/'
                className='flex cursor-pointer py-1.5 text-xl font-medium text-black no-underline dark:text-white'
              >
                <Image alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />
                &nbsp;PeaNUT
              </Link>
              <div className='flex items-center'>
                <div>
                  <DayNightSwitch />
                </div>
                &nbsp;
                <div>
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
                    <HiOutlineCog6Tooth className='h-6! w-6! text-black dark:text-white' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
