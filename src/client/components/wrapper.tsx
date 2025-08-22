'use client'

import React, { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiQuestionMarkCircle } from 'react-icons/hi2'
import { TbSettings } from 'react-icons/tb'
import { Button } from '@/client/components/ui/button'
import { useTranslation } from 'react-i18next'
import NavBar from '@/client/components/navbar'
import NavBarControls from '@/client/components/navbar-controls'
import Footer from '@/client/components/footer'
import { LanguageContext } from '@/client/context/language'
import { DevicesData } from '@/common/types'
import DayNightSwitch from './daynight'
import LanguageSwitcher from '@/client/components/language-switcher'
import { Card } from '@/client/components/ui/card'
import { MemoizedDeviceGrid } from '@/client/components/device-grid'
import { Skeleton } from '@/client/components/ui/skeleton'
import DeviceGridSkeleton from './device-grid-skeleton'
import { useNavigation } from '@/hooks/useNavigation'

type Props = Readonly<{
  getDevicesAction: () => Promise<DevicesData>
  logoutAction: () => void
}>

export default function Wrapper({ getDevicesAction, logoutAction }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { push } = useNavigation()
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['devicesData'],
    queryFn: async () => await getDevicesAction(),
  })

  if (!data?.devices || isLoading) {
    return (
      <div data-testid='wrapper' className='bg-background flex h-full min-h-screen flex-col'>
        <NavBar>
          <NavBarControls
            disableRefresh={true}
            onRefreshClick={() => refetch()}
            onRefetch={() => refetch()}
            onLogout={logoutAction}
          />
        </NavBar>
        <div className='flex grow justify-center px-3'>
          <div className='container'>
            <Card className='border-border-card bg-card mb-4 w-full border shadow-none'>
              <div className='p-4'>
                <DeviceGridSkeleton rows={4} />
              </div>
            </Card>
          </div>
        </div>
        <div className='flex justify-center px-3'>
          <div className='container'>
            <Skeleton className='bg-muted mb-3 h-4 w-32' />
          </div>
        </div>
      </div>
    )
  }
  if (data.devices.length === 0) {
    return (
      <div data-testid='empty-wrapper' className='bg-background flex h-full min-h-screen flex-col'>
        <NavBar>
          <NavBarControls
            disableRefresh={true}
            onRefreshClick={() => refetch()}
            onRefetch={() => refetch()}
            onLogout={logoutAction}
          />
        </NavBar>
        <div className='flex grow justify-center px-3'>
          <div className='container'>
            <Card className='border-border-card bg-card mb-4 w-full border shadow-none'>
              <div className='flex flex-col items-center justify-center p-8'>
                <HiQuestionMarkCircle className='text-muted-foreground mb-4 h-16 w-16' />
                <h2 className='text-muted-foreground mb-2 text-xl font-semibold'>{t('noDevices.title')}</h2>
                <p className='text-muted-foreground mb-4 text-center'>{t('noDevices.description')}</p>
                <div className='flex gap-2'>
                  <Button onClick={() => push('/settings')} className='cursor-pointer'>
                    <TbSettings className='mr-2 h-4 w-4' />
                    {t('sidebar.settings')}
                  </Button>
                  <div className='hidden sm:block'>
                    <DayNightSwitch />
                  </div>
                  <div className='hidden sm:block'>
                    <LanguageSwitcher />
                  </div>
                </div>
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
