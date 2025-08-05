'use client'

import React, { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiQuestionMarkCircle } from 'react-icons/hi2'
import { TbSettings } from 'react-icons/tb'
import { Button } from '@/client/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import NavBar from '@/client/components/navbar'
import NavBarControls from '@/client/components/navbar-controls'
import Footer from '@/client/components/footer'
import Loader from '@/client/components/loader'
import { LanguageContext } from '@/client/context/language'
import { DevicesData } from '@/common/types'
import DayNightSwitch from './daynight'
import LanguageSwitcher from '@/client/components/language-switcher'
import { Card } from '@/client/components/ui/card'
import { MemoizedDeviceGrid } from '@/client/components/device-grid'
import UPSNotificationControls from './ups-notification-controls'

type Props = Readonly<{
  getDevicesAction: () => Promise<DevicesData>
  logoutAction: () => void
}>

export default function Wrapper({ getDevicesAction, logoutAction }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['devicesData'],
    queryFn: async () => await getDevicesAction(),
  })

  const loadingWrapper = (
    <div
      className='bg-background absolute top-0 left-0 flex h-full w-full items-center justify-center text-center'
      data-testid='loading-wrapper'
    >
      <Loader />
    </div>
  )

  if (!data?.devices || isLoading) {
    return loadingWrapper
  }
  if (data.devices.length === 0) {
    return (
      <div className='bg-background flex h-full min-h-screen flex-col' data-testid='empty-wrapper'>
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
        <div className='flex flex-1 flex-col items-center justify-center'>
          <Card className='border-border-card bg-card flex flex-col items-center p-6 shadow-none'>
            <div className='flex flex-col items-center pb-2'>
              <HiQuestionMarkCircle className='text-destructive mb-4 text-8xl' />
              <p>{t('noDevicesError')}</p>
            </div>
            <div>
              <Button
                variant='default'
                title={t('sidebar.settings')}
                className='shadow-none'
                onClick={() => router.push('/settings')}
              >
                <TbSettings className='size-6! stroke-[1.5px]' />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div data-testid='wrapper' className='bg-background flex h-full min-h-screen flex-col'>
      <NavBar>
        <NavBarControls
          disableRefresh={isLoading}
          onRefreshClick={() => refetch()}
          onRefetch={() => refetch()}
          onLogout={logoutAction}
          failedServers={data.failedServers}
        />
      </NavBar>
      <div className='flex grow justify-center px-3'>
        <div className='container'>
          <UPSNotificationControls />
          <Card className='border-border-card bg-card mb-4 w-full border shadow-none'>
            <div className='p-4'>
              <MemoizedDeviceGrid key={lng} data={data} />
            </div>
          </Card>
        </div>
      </div>
      <div className='flex justify-center px-3'>
        <div className='container'>
          <Footer updated={data.updated} />
        </div>
      </div>
    </div>
  )
}
