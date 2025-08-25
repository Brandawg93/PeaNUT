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
      <div className='bg-background flex h-full min-h-screen flex-col' data-testid='empty-wrapper'>
        <NavBar>
          <NavBarControls
            disableRefresh={true}
            onRefreshClick={() => refetch()}
            onRefetch={() => refetch()}
            onLogout={logoutAction}
          />
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
                onClick={() => push('/settings')}
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
