'use client'

import React, { useContext, useState } from 'react'
import { Card, Drawer, IconButton, Navbar, Typography } from '@material-tailwind/react'
import Image from 'next/image'
import logo from '@/app/icon.svg'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import DayNightSwitch from '@/client/components/daynight'
import LanguageSwitcher from '@/client/components/language-switcher'
import { LanguageContext } from '@/client/context/language'
import { useTranslation } from 'react-i18next'

export default function SettingsLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const openDrawer = () => setIsDrawerOpen(!isDrawerOpen)
  const closeDrawer = () => setIsDrawerOpen(false)

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
              <div className='hidden lg:block'>
                <LanguageSwitcher />
              </div>
              <IconButton
                variant='text'
                data-testid={isDrawerOpen ? 'close-drawer' : 'open-drawer'}
                className='block lg:hidden'
                size='lg'
                onClick={openDrawer}
              >
                {isDrawerOpen ? (
                  <XMarkIcon className='h-8 w-8 stroke-2 dark:text-white' />
                ) : (
                  <Bars3Icon className='h-8 w-8 stroke-2 dark:text-white' />
                )}
              </IconButton>
              {isDrawerOpen ? (
                <div className='absolute left-0 top-0 h-screen w-screen bg-black/50 backdrop-blur'></div>
              ) : null}
              <Drawer
                overlay={false}
                open={isDrawerOpen}
                onClose={closeDrawer}
                placement='right'
                className='rounded-l dark:bg-gray-900'
              >
                <Card
                  color='transparent'
                  shadow={false}
                  className='h-[calc(100vh-2rem)] w-full justify-between p-4 dark:text-white'
                >
                  <div>
                    <div className='mb-2 flex items-center gap-4 p-4'>
                      <Typography variant='h5'>{t('sidebar.settings')}</Typography>
                      <div className='flex w-full justify-end'>
                        <IconButton variant='text' size='lg' onClick={closeDrawer}>
                          <XMarkIcon className='h-8 w-8 stroke-2 dark:text-white' />
                        </IconButton>
                      </div>
                    </div>
                    <hr />
                    <div className='grid grid-flow-row grid-cols-2'>
                      <div className='flex flex-col justify-around'>
                        <Typography className='font-medium text-gray-800 dark:text-gray-300'>
                          {t('sidebar.theme')}
                        </Typography>
                      </div>
                      <div className='mb-3 mt-3'>
                        <DayNightSwitch />
                      </div>
                    </div>
                    <hr />
                    <div className='grid grid-flow-row grid-cols-2'>
                      <div className='flex flex-col justify-around'>
                        <Typography className='font-medium text-gray-800 dark:text-gray-300'>
                          {t('sidebar.moreSettings')}
                        </Typography>
                      </div>
                    </div>
                  </div>
                  <div className='mt-6 text-right text-gray-600'>
                    <Link className='text-sm underline' href='/api/docs' target='_blank' rel='noreferrer'>
                      {t('docs')}
                    </Link>
                  </div>
                </Card>
              </Drawer>
            </div>
          </div>
        </div>
      </Navbar>
      {children}
    </div>
  )
}
