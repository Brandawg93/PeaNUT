'use client'

import React, { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiQuestionMarkCircle, HiOutlineExclamationCircle } from 'react-icons/hi2'
import { TbSettings } from 'react-icons/tb'
import { Button } from '@/client/components/ui/button'
import { useTranslation } from 'react-i18next'
import NavBar from '@/client/components/navbar'
import PageStatus from '@/client/components/page-status'
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
  const { isLoading, isError, data, refetch } = useQuery({
    queryKey: ['devicesData', getDevicesAction],
    queryFn: async () => await getDevicesAction(),
  })

  // A rejected initial query has no data, but is no longer loading. Keep cached
  // devices on refresh errors, and offer retry instead of a permanent skeleton.
  if (isError && !data?.devices) {
    return (
      <PageStatus
        testId='error-wrapper'
        controls={
          <NavBarControls
            disableRefresh={false}
            onRefreshClick={() => refetch()}
            onRefetch={() => refetch()}
            onLogout={logoutAction}
          />
        }
        action={
          <Button variant='default' title={t('refresh')} className='shadow-none' onClick={() => refetch()}>
            {t('refresh')}
          </Button>
        }
      >
        <HiOutlineExclamationCircle className='text-destructive mb-4 text-8xl' />
        <p>{t('error')}</p>
      </PageStatus>
    )
  }

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
      <PageStatus
        testId='empty-wrapper'
        controls={
          <NavBarControls
            disableRefresh={true}
            onRefreshClick={() => refetch()}
            onRefetch={() => refetch()}
            onLogout={logoutAction}
          />
        }
        action={
          <Button
            variant='default'
            title={t('sidebar.settings')}
            className='shadow-none'
            onClick={() => push('/settings')}
          >
            <TbSettings className='size-6! stroke-[1.5px]' />
          </Button>
        }
      >
        <HiQuestionMarkCircle className='text-destructive mb-4 text-8xl' />
        <p>{t('noDevicesError')}</p>
      </PageStatus>
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
