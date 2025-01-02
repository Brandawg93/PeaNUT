'use client'

import React, { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { IconButton, Navbar, Typography } from '@material-tailwind/react'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'
import Image from 'next/image'
import logo from '@/app/icon.svg'
import LanguageSwitcher from '@/client/components/language-switcher'
import { LanguageContext } from '@/client/context/language'
import { useTranslation } from 'react-i18next'
import DayNightSwitch from '@/client/components/daynight'

export default function SettingsLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()

  return (
    <div
      className='flex h-full min-h-screen flex-col bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-900 dark:text-white'
      data-testid='wrapper'
    >
      <Navbar
        variant='gradient'
        color='gray'
        className='sticky top-0 z-10 mb-4 flex h-max max-w-full justify-center rounded-none bg-gradient-to-t from-gray-300 to-gray-100 px-4 py-2 lg:px-8 lg:py-4 dark:from-gray-950 dark:to-gray-900'
      >
        <div className='container'>
          <div className='flex items-center justify-between'>
            <Typography
              as='a'
              href='/'
              className='flex cursor-pointer py-1.5 text-xl font-medium text-black no-underline dark:text-white'
            >
              <Image alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />
              &nbsp;PeaNUT
            </Typography>
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
                <IconButton
                  variant='text'
                  className='px-3 text-black shadow-none hover:bg-gray-400 dark:text-white dark:hover:bg-gray-800'
                  title={t('sidebar.settings')}
                  onClick={() => router.push('/settings')}
                >
                  <HiOutlineCog6Tooth className='h-6 w-6 stroke-2 dark:text-white' />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </Navbar>
      {children}
    </div>
  )
}
