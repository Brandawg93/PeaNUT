'use client'

import React, { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiQuestionMarkCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2'
import { TbSettings } from 'react-icons/tb'
import { Button } from '@/client/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { MemoizedGrid } from '@/client/components/grid'
import Gauge from '@/client/components/gauge'
import Kpi from '@/client/components/kpi'
import NavBar from '@/client/components/navbar'
import NavBarControls from '@/client/components/navbar-controls'
import Runtime from '@/client/components/runtime'
import Footer from '@/client/components/footer'
import Loader from '@/client/components/loader'
import ChartsContainer from '@/client/components/line-charts/charts-container'
import Actions from '@/client/components/actions'
import { LanguageContext } from '@/client/context/language'
import { upsStatus } from '@/common/constants'
import { DeviceData } from '@/common/types'
import DayNightSwitch from './daynight'
import LanguageSwitcher from './language-switcher'
import { Card } from '@/client/components/ui/card'

const getStatus = (status: keyof typeof upsStatus) => {
  if (status.startsWith('OL')) {
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
  const [wattsOrPercent, setWattsOrPercent] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('wattsOrPercent') === 'true' : false
  )
  const [wattHours, setWattHours] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('wattHours') === 'true' : false
  )
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['deviceData', device],
    queryFn: async () => await getDeviceAction(device),
  })

  const loadingWrapper = (
    <div
      className='bg-background absolute top-0 left-0 flex h-full w-full items-center justify-center text-center'
      data-testid='loading-wrapper'
    >
      <Loader />
    </div>
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

  const toggleWattsOrPercent = () => {
    setWattsOrPercent((prev) => {
      localStorage.setItem('wattsOrPercent', (!prev).toString())
      return !prev
    })
  }

  const toggleWattHours = () => {
    setWattHours((prev) => {
      localStorage.setItem('wattHours', (!prev).toString())
      return !prev
    })
  }

  const currentLoad = () => {
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
  }

  const currentWh = () => {
    if (vars['battery.charge']) {
      if (vars['ups.load'] && vars['ups.realpower.nominal'] && wattHours) {
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
          title={`${t('batteryCharge')} (%)`}
        />
      )
    } else {
      return <Kpi text='N/A' description={t('batteryCharge')} />
    }
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
                {getStatus(vars['ups.status']?.value as keyof typeof upsStatus)}
                &nbsp;{upsStatus[vars['ups.status']?.value as keyof typeof upsStatus] || vars['ups.status']?.value}
              </p>
              <div className='flex justify-end'>
                <Actions commands={ups.commands} device={ups.name} runCommandAction={runCommandAction} />
              </div>
            </div>
          </div>
          <div className='grid grid-flow-row grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-3'>
            <div className='mb-4'>{currentLoad()}</div>
            <div className='mb-4'>{currentWh()}</div>
            <div className='mb-4'>
              <Runtime runtime={+vars['battery.runtime']?.value} />
            </div>
          </div>
          <ChartsContainer vars={vars} data={data} name={ups.name} />
          <div>
            <MemoizedGrid data={ups} />
          </div>
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
