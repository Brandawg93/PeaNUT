'use client'

import React, { useContext, useMemo, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  HiOutlineCheck,
  HiBolt,
  HiOutlineExclamationTriangle,
  HiQuestionMarkCircle,
  HiOutlineExclamationCircle,
  HiXCircle,
} from 'react-icons/hi2'
import { TbSettings } from 'react-icons/tb'
import { Button } from '@/client/components/ui/button'
import { Skeleton } from '@/client/components/ui/skeleton'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { MemoizedGrid } from '@/client/components/grid'
import Gauge from '@/client/components/gauge'
import Kpi from '@/client/components/kpi'
import NavBar from '@/client/components/navbar'
import NavBarControls from '@/client/components/navbar-controls'
import Runtime from '@/client/components/runtime'
import Footer from '@/client/components/footer'
import ChartsContainer from '@/client/components/line-charts/charts-container'
import Actions from '@/client/components/actions'
import { LanguageContext } from '@/client/context/language'
import { upsStatus } from '@/common/constants'
import { DeviceData } from '@/common/types'
import DayNightSwitch from './daynight'
import LanguageSwitcher from './language-switcher'
import { Card } from '@/client/components/ui/card'
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/utils'
import { useSettings } from '@/client/context/settings'
import { DashboardSectionConfig } from '@/server/settings'
import DeviceGridSkeleton from './device-grid-skeleton'

const getStatus = (status: string | number | undefined) => {
  if (!status || typeof status !== 'string') {
    return <></>
  }
  if (status === 'OL CHRG') {
    return <HiBolt data-testid='bolt-icon' className='mb-1 inline-block size-6 text-yellow-400' />
  } else if (status.startsWith('OL')) {
    return <HiOutlineCheck data-testid='check-icon' className='mb-1 inline-block size-6 stroke-[3px] text-green-400' />
  } else if (status.startsWith('OB')) {
    return (
      <HiOutlineExclamationTriangle
        data-testid='triangle-icon'
        className='mb-1 inline-block size-6 stroke-[3px] text-yellow-400'
      />
    )
  } else if (status.startsWith('LB')) {
    return (
      <HiOutlineExclamationCircle
        data-testid='exclamation-icon'
        className='mb-1 inline-block size-6 stroke-[3px] text-red-400'
      />
    )
  } else if (status.startsWith(upsStatus.DEVICE_UNREACHABLE)) {
    return <HiXCircle data-testid='xcross-icon' className='mb-1 inline-block size-6 text-red-400' />
  } else {
    return <></>
  }
}

const roundIfNeeded = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

type Props = Readonly<{
  device: string
  getDeviceAction: (device: string) => Promise<DeviceData>
  runCommandAction: (device: string, command: string) => Promise<{ error: any }>
  logoutAction: () => void
}>

export default function DeviceWrapper({ device, getDeviceAction, runCommandAction, logoutAction }: Props) {
  const [wattsOrPercent, setWattsOrPercent] = useState<boolean>(() => {
    const stored = getLocalStorageItem('wattsOrPercent')
    return stored === 'true'
  })
  const [wattHours, setWattHours] = useState<boolean>(() => {
    const stored = getLocalStorageItem('wattHours')
    return stored === 'true'
  })
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()
  const { settings } = useSettings()
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['deviceData', device],
    queryFn: async () => await getDeviceAction(device),
  })

  const sections = useMemo<DashboardSectionConfig>(() => {
    const defaultSections: DashboardSectionConfig = [
      { key: 'KPIS', enabled: true },
      { key: 'CHARTS', enabled: true },
      { key: 'VARIABLES', enabled: true },
    ]
    const configured = settings.DASHBOARD_SECTIONS
    return configured?.length ? configured : defaultSections
  }, [settings.DASHBOARD_SECTIONS])

  const loadingWrapper = useMemo(
    () => (
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
            <div className='mb-4 flex flex-row justify-between'>
              <div>
                <Skeleton className='bg-muted mb-2 h-4 w-32' />
                <Skeleton className='bg-muted mb-2 h-4 w-40' />
                <Skeleton className='bg-muted h-4 w-36' />
              </div>
              <div>
                <Skeleton className='bg-muted mb-2 h-8 w-48' />
                <div className='flex justify-end'>
                  <Skeleton className='bg-muted h-8 w-20' />
                </div>
              </div>
            </div>
            {sections
              .filter((s) => s.enabled)
              .map((s) => (
                <div key={s.key} className='mb-4'>
                  {s.key === 'VARIABLES' ? (
                    <DeviceGridSkeleton />
                  ) : s.key === 'KPIS' ? (
                    <div className='grid grid-flow-row grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-3'>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className='mb-4'>
                          <div className='border-border-card bg-card relative flex h-52 flex-row justify-around rounded-xl border text-center shadow-none'>
                            <div className='motion-safe:animate-fade flex h-full w-full flex-col justify-around pb-5 align-middle text-3xl font-semibold'>
                              <Skeleton className='bg-muted mx-auto h-8 w-24' />
                            </div>
                            <div className='absolute bottom-5.5 w-full'>
                              <Skeleton className='bg-muted mx-auto h-3 w-20' />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : s.key === 'CHARTS' ? (
                    <div className='border-border-card bg-card rounded-xl border p-6 shadow-none'>
                      <Skeleton className='bg-muted mb-4 h-6 w-32' />
                      <Skeleton className='bg-muted h-64 w-full' />
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
        <div className='flex justify-center px-3'>
          <div className='container'>
            <Skeleton className='bg-muted h-4 w-32' />
          </div>
        </div>
      </div>
    ),
    [sections, refetch, logoutAction]
  )

  const toggleWattsOrPercent = useCallback(() => {
    setWattsOrPercent((prev) => {
      setLocalStorageItem('wattsOrPercent', (!prev).toString())
      return !prev
    })
  }, [])

  const toggleWattHours = useCallback(() => {
    setWattHours((prev) => {
      setLocalStorageItem('wattHours', (!prev).toString())
      return !prev
    })
  }, [])

  const currentLoad = useMemo(() => {
    if (!data?.device?.vars) return <Kpi text='N/A' description={t('currentLoad')} />

    const vars = data.device.vars
    if (vars['ups.load']) {
      if (vars['ups.realpower.nominal'] && wattsOrPercent) {
        const currentWattage = (+vars['ups.load'].value / 100) * +vars['ups.realpower.nominal'].value
        return (
          <Kpi
            onClick={toggleWattsOrPercent}
            text={`${roundIfNeeded(currentWattage)}W`}
            description={`${t('currentLoad')} (W)`}
          />
        )
      }
      return (
        <Gauge
          onClick={toggleWattsOrPercent}
          percentage={+vars['ups.load'].value}
          title={`${t('currentLoad')} (%)`}
          invert
        />
      )
    }
    return <Kpi text='N/A' description={t('currentLoad')} />
  }, [data?.device?.vars, wattsOrPercent, toggleWattsOrPercent, t])

  const currentWh = useMemo(() => {
    if (!data?.device?.vars) return <Kpi text='N/A' description={t('batteryCharge')} />

    const vars = data.device.vars
    if (vars['battery.charge']) {
      if (
        vars['ups.load'] &&
        vars['ups.realpower.nominal'] &&
        wattHours &&
        vars['battery.runtime']?.value !== undefined
      ) {
        const currentWattage = (+vars['ups.load'].value / 100) * +vars['ups.realpower.nominal'].value
        const capacity = (+vars['battery.runtime'].value / 3600) * currentWattage
        return (
          <Kpi
            onClick={toggleWattHours}
            text={`${roundIfNeeded(capacity)}Wh`}
            description={`${t('batteryCharge')} (Wh)`}
          />
        )
      }
      return (
        <Gauge
          onClick={toggleWattHours}
          percentage={+vars['battery.charge']?.value}
          warningAt={+vars['battery.charge.warning']?.value}
          lowAt={+vars['battery.charge.low']?.value}
          title={`${t('batteryCharge')} (%)`}
        />
      )
    } else {
      return <Kpi text='N/A' description={t('batteryCharge')} />
    }
  }, [data?.device?.vars, wattHours, toggleWattHours, t])

  const renderSection = useCallback(
    (key: string) => {
      if (!data?.device?.vars) return null

      const vars = data.device.vars
      const ups = data.device

      switch (key) {
        case 'KPIS':
          return (
            <div className='grid grid-flow-row grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-3'>
              <div className='mb-4'>{currentLoad}</div>
              <div className='mb-4'>{currentWh}</div>
              <div className='mb-4'>
                <Runtime
                  runtime={+vars['battery.runtime']?.value}
                  batteryCapacity={+vars['battery.capacity']?.value}
                  batteryVoltage={+vars['battery.voltage']?.value}
                  batteryCharge={+vars['battery.charge']?.value}
                  upsLoad={+vars['ups.load']?.value}
                  upsRealpowerNominal={+vars['ups.realpower.nominal']?.value}
                />
              </div>
            </div>
          )
        case 'CHARTS':
          return <ChartsContainer vars={vars} data={data} name={ups.name} />
        case 'VARIABLES':
          return (
            <div>
              <MemoizedGrid data={ups} onRefetchAction={refetch} />
            </div>
          )
        default:
          return null
      }
    },
    [currentLoad, currentWh, data, refetch]
  )

  if (isLoading) {
    return loadingWrapper
  }
  if (!data?.device) {
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

  const ups = data.device
  const vars = ups.vars
  if (!vars) {
    return loadingWrapper
  }

  return (
    <div data-testid='wrapper' className='bg-background flex h-full min-h-screen flex-col'>
      <NavBar>
        <NavBarControls
          disableRefresh={isLoading}
          onRefreshClick={() => refetch()}
          onRefetch={() => refetch()}
          onLogout={logoutAction}
        />
      </NavBar>
      <div className='flex grow justify-center px-3'>
        <div className='container'>
          <div className='mb-4 flex flex-row justify-between'>
            <div>
              {vars['ups.mfr']?.value || vars['ups.model']?.value ? (
                <>
                  <p className='m-0'>
                    {t('manufacturer')}: {vars['ups.mfr']?.value}
                  </p>
                  <p className='m-0'>
                    {t('model')}: {vars['ups.model']?.value}
                  </p>
                </>
              ) : (
                <p className='m-0'>
                  {t('device')}: {ups.description}
                </p>
              )}
              <p>
                {t('serial')}: {vars['device.serial']?.value}
              </p>
            </div>
            <div>
              <p className='text-2xl font-semibold'>
                {getStatus(vars['ups.status']?.value)}
                &nbsp;
                {(vars['ups.status']?.value &&
                  typeof vars['ups.status'].value === 'string' &&
                  upsStatus[vars['ups.status'].value as keyof typeof upsStatus]) ||
                  (!vars['ups.status']?.value || vars['ups.status']?.value === '0' ? '' : vars['ups.status']?.value)}
              </p>
              <div className='flex justify-end'>
                <Actions commands={ups.commands} device={ups.name} runCommandAction={runCommandAction} />
              </div>
            </div>
          </div>
          {sections
            .filter((s) => s.enabled)
            .map((s) => (
              <div key={s.key} className='mb-4'>
                {renderSection(s.key)}
              </div>
            ))}
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
